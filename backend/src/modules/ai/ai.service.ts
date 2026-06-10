import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { AI_PROVIDER } from './ai.provider';
import * as aiProviderInterface from './interfaces/ai-provider.interface';
import { ScrappingService } from './scrapping.service';
import {
  GeneratedSuggestedTopic,
  SuggestedTopicGenerationContext,
} from '../suggested-topic/interfaces/suggested-topic-generation.interface';

@Injectable()
export class AIService {
  constructor(
    @Inject(AI_PROVIDER)
    private readonly provider: aiProviderInterface.AIProvider,
    private readonly scrappingService: ScrappingService,
  ) {}

  async generateText(prompt: string): Promise<string> {
    return this.provider.generateText(prompt);
  }

  async analyzeDocument(
      file: Express.Multer.File,
  ): Promise<{ title: string; summary: string; fileName: string }> {
      const fileId = await this.provider.uploadFile(file);
      const fileUrl = await this.provider.getFileUrl(fileId);
      const { title, summary } = await this.provider.analyzeDocument(fileUrl, file.originalname);
      await this.provider.deleteFile(fileId);
      return { title, summary, fileName: file.originalname };
  }

  async generateTextFromWebContent(
    url: string,
  ): Promise<{ title: string; summary: string }> {
    try {
      const { content } = await this.scrappingService.scrapeUrl(url);
      return await this.provider.generateTextFromWebContent(content);
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de l'analyse du contenu du site web : ${error.message}`,
      );
    }
  }

  async generatePost(
    platform: string,
    subject: string,
    tone: string,
    length: string,
  ): Promise<{
    title: string;
    content: string;
    tags: string[];
    references: string[];
  }> {
    try {
      return await this.provider.generatePost(platform, subject, tone, length);
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de la génération du post : ${error.message}`,
      );
    }
  }

  async generateSuggestedTopics(
    terms: string,
    context: SuggestedTopicGenerationContext,
  ): Promise<GeneratedSuggestedTopic[]> {
    try {
      return await this.provider.generateSuggestedTopics(terms, context);
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de la génération des idées : ${error.message}`,
      );
    }
  }
}

