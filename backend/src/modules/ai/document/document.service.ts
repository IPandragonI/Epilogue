// document/document.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DocumentService {
  private readonly mistralApiKey = process.env.MISTRAL_API_KEY;
  private readonly mistralApiUrl = 'https://api.mistral.ai/v1';

  constructor() {}

  async uploadAndAnalyze(
    file: Express.Multer.File,
  ): Promise<{ title: string; summary: string; fileName: string }> {
    // 1. Upload le fichier vers Mistral
    const mistralFileId = await this.uploadFileToMistral(file);

    // 2. Créer un signed URL pour accéder au fichier
    const signedUrl = await this.getMistralSignedUrl(mistralFileId);

    const { title, summary } = await this.analyzeWithMistral(
      signedUrl,
      file.originalname,
    );

    //delete the file from mistral after analysis
    await fetch(`${this.mistralApiUrl}/files/${mistralFileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.mistralApiKey}`,
      },
    });

    return { title, summary, fileName: file.originalname };
  }

  private async uploadFileToMistral(
    file: Express.Multer.File,
  ): Promise<string> {
    const formData = new FormData();

    // Convert Node Buffer to a Uint8Array copy (ensures underlying ArrayBuffer is a plain ArrayBuffer)
    const buffer = file.buffer;
    const uint8copy = new Uint8Array(buffer.byteLength);
    uint8copy.set(buffer as any, 0);
    const blob = new Blob([uint8copy], { type: file.mimetype });
    console.log(blob);
    formData.append('file', blob, file.originalname);
    formData.append('purpose', 'ocr'); // 'ocr' pour l'extraction de contenu

    const response = await fetch(`${this.mistralApiUrl}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.mistralApiKey}`,
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

  private async getMistralSignedUrl(fileId: string): Promise<string> {
    const response = await fetch(`${this.mistralApiUrl}/files/${fileId}/url`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.mistralApiKey}`,
      },
    });

    if (!response.ok) {
      throw new InternalServerErrorException(
        'Failed to get Mistral signed URL',
      );
    }

    const data = await response.json();
    return data.url;
  }

  private async analyzeWithMistral(
    signedUrl: string,
    originalName: string,
  ): Promise<{ title: string; summary: string }> {
    const response = await fetch(`${this.mistralApiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.mistralApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document_url',
                document_url: signedUrl,
              },
              {
                type: 'text',
                text: `Analyse ce document et réponds UNIQUEMENT en JSON valide (sans balises markdown) avec ce format exact :
{
  "title": "le titre du document",
  "summary": "un résumé clair et concis du document en 3-5 phrases"
}
Le nom du fichier original est : "${originalName}"`,
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
}
