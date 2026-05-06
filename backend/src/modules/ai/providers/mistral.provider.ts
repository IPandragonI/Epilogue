import { AIProvider } from '../interfaces/ai-provider.interface';
import { postJSON } from '../utils/http';
import { MistralResponse } from '../interfaces/ai-responses.interface';
import { InternalServerErrorException } from '@nestjs/common';
import { PromptService } from '../prompt.service';

export class MistralProvider implements AIProvider {
  constructor(private readonly promptService: PromptService) {}

  async generateText(prompt: string): Promise<string> {
    const data: MistralResponse = await postJSON<MistralResponse>(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-small',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
    );

    return data.choices[0].message.content;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const formData = new FormData();

    const buffer = file.buffer;
    const uint8copy = new Uint8Array(buffer.byteLength);
    uint8copy.set(buffer as any, 0);
    const blob = new Blob([uint8copy], { type: file.mimetype });
    formData.append('file', blob, file.originalname);
    formData.append('purpose', 'ocr'); // 'ocr' pour l'extraction de contenu

    const response = await fetch(`https://api.mistral.ai/v1/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new InternalServerErrorException(
        `Mistral file upload failed: ${error}`,
      );
    }

    const data = await response.json();
    return data.id;
  }

  async getFileUrl(fileId: string): Promise<string> {
    const response = await fetch(
      `https://api.mistral.ai/v1/files/${fileId}/url`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
      },
    );

    if (!response.ok) {
      throw new InternalServerErrorException(
        'Failed to get Mistral signed URL',
      );
    }

    const data = await response.json();
    return data.url;
  }

  async analyzeDocument(
    signedUrl: string,
    originalName: string,
  ): Promise<{ title: string; summary: string }> {
    const systemPrompt = this.promptService.getPrompt('analyse-document');

    const response = await fetch(`https://api.mistral.ai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'document_url',
                document_url: signedUrl,
              },
              {
                type: 'text',
                text: `Le nom du fichier original est : "${originalName}"`,
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new InternalServerErrorException(
        `Mistral analysis failed: ${error}`,
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      return JSON.parse(content);
    } catch {
      throw new InternalServerErrorException(
        'Failed to parse Mistral response as JSON',
      );
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    //delete the file from the provider after analysis
    await fetch(`https://api.mistral.ai/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
    });
  }

  async generateTextFromWebContent(
    content: string,
  ): Promise<{ title: string; summary: string }> {
    const systemPrompt = this.promptService.getPrompt('analyse-scrapping');

    const response: MistralResponse = await postJSON<MistralResponse>(
      `https://api.mistral.ai/v1/chat/completions`,
      {
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: content,
              },
            ],
          },
        ],
      },
      {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
    );

    const raw = response.choices[0].message.content as string;

    const cleaned = raw
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    return JSON.parse(cleaned);
  }
}
