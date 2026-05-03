// document/document.service.ts
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AI_PROVIDER } from '../ai.provider';
import * as aiProviderInterface from '../interfaces/ai-provider.interface';

@Injectable()
export class DocumentService {
  private readonly mistralApiKey = process.env.MISTRAL_API_KEY;
  private readonly mistralApiUrl = 'https://api.mistral.ai/v1';

  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: aiProviderInterface.AIProvider,
  ) {}

  async uploadAndAnalyze(
    file: Express.Multer.File,
  ): Promise<{ title: string; summary: string; fileName: string }> {
    // 1. Upload le fichier vers Mistral
    const mistralFileId = await this.provider.uploadFileToMistral(file);

    const signedUrl = await this.provider.getMistralSignedUrl(mistralFileId);

    const { title, summary } = await this.provider.analyzeWithMistral(
      signedUrl,
      file.originalname,
    );

    await this.provider.removeFileFromMistral(mistralFileId);

    return { title, summary, fileName: file.originalname };
  }

  async generateTextFromWebSite(
    content: string,
  ): Promise<{ title: string; summary: string }> {
    try {
      return await this.provider.generateTextFromWebSite(content);
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de l'analyse du contenu du site web : ${error.message}`,
      );
    }
  }
}
