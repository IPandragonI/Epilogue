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

  async generatePost(
    platform: string,
    subject: string,
    tone: string,
    length: string,
  ): Promise<{ title: string; content: string; tags: string[]; references: string[] }> {
      const systemPrompt = this.promptService.getPrompt('generate-post');
      const lengthConfig = getLengthConfig(platform, length);
      const hardCap      = Math.min(lengthConfig.max, ABSOLUTE_MAX);

      const response: MistralResponse = await postJSON<MistralResponse>(
      `https://api.mistral.ai/v1/chat/completions`,
      {
        model: 'mistral-small-latest',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Platform: ${platform}\nSubject: ${subject}\nTone: ${tone}\nLength: ${lengthConfig.instruction}`,
              },
            ],
          },
        ],
      },
      { Authorization: `Bearer ${process.env.MISTRAL_API_KEY}` },
    );

    const parsed  = JSON.parse(response.choices[0].message.content as string);
    const content = truncateHtml(parsed.content ?? '', hardCap);

    return {
      title:      parsed.title ?? '',
      content,
      tags:       Array.isArray(parsed.tags)       ? parsed.tags       : [],
      references: Array.isArray(parsed.references) ? parsed.references : [],
    };
  }
}

interface LengthConfig {
  instruction: string;
  max: number;
}

type PlatformLengthMap = Record<string, Record<string, LengthConfig>>;

const PLATFORM_LENGTH_MAP: PlatformLengthMap = {
  linkedin: {
    court: {
      instruction: 'court : 300 à 400 caractères HTML maximum',
      max: 500,
    },
    moyen: {
      instruction: 'moyen : 600 à 750 caractères HTML maximum',
      max: 900,
    },
    long: {
      instruction: 'long : 1000 à 1200 caractères HTML maximum',
      max: 1400,
    },
  },
  twitter: {
    court: {
      instruction: 'très court : 100 à 140 caractères HTML maximum',
      max: 180,
    },
    moyen: {
      instruction: 'court : 150 à 180 caractères HTML maximum',
      max: 220,
    },
    long: {
      instruction: 'court : 200 à 240 caractères HTML maximum',
      max: 260,
    },
  },
  instagram: {
    court: {
      instruction: 'court : 200 à 300 caractères HTML maximum',
      max: 400,
    },
    moyen: {
      instruction: 'moyen : 400 à 550 caractères HTML maximum',
      max: 700,
    },
    long: {
      instruction: 'long : 700 à 900 caractères HTML maximum',
      max: 1100,
    },
  },
  blog: {
    court: {
      instruction: 'court : 500 à 650 caractères HTML maximum',
      max: 800,
    },
    moyen: {
      instruction: 'moyen : 900 à 1100 caractères HTML maximum',
      max: 1400,
    },
    long: {
      instruction: 'long : 1500 à 1800 caractères HTML maximum',
      max: 2100,
    },
  },
};

const ABSOLUTE_MAX = 2900;
const DEFAULT_PLATFORM = 'linkedin';
const DEFAULT_LENGTH = 'moyen';

function getLengthConfig(platform: string, length: string): LengthConfig {
  const platformMap =
    PLATFORM_LENGTH_MAP[platform.toLowerCase()] ??
    PLATFORM_LENGTH_MAP[DEFAULT_PLATFORM];
  return platformMap[length] ?? platformMap[DEFAULT_LENGTH];
}

function truncateHtml(html: string, maxChars: number): string {
  if (html.length <= maxChars) return html;

  let truncated = html.slice(0, maxChars);

  const lastOpen = truncated.lastIndexOf('<');
  const lastClose = truncated.lastIndexOf('>');
  if (lastOpen > lastClose) {
    truncated = truncated.slice(0, lastOpen);
  }

  if (!truncated.trimEnd().endsWith('>')) {
    truncated += '</p>';
  }

  return truncated.trimEnd();
}
