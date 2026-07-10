import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AI_PROVIDER } from './ai.provider';
import * as aiProviderInterface from './interfaces/ai-provider.interface';
import { ScrappingService } from './scrapping.service';
import { CurationItemService } from '../curation-item/curation-item.service';
import { ContentService } from '../content/content.service';
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
    private readonly curationItemService: CurationItemService,
    private readonly contentService: ContentService,
  ) {}

  async generateText(prompt: string): Promise<string> {
    return this.provider.generateText(prompt);
  }

  async analyzeDocument(
    file: Express.Multer.File,
  ): Promise<{ title: string; summary: string; fileName: string }> {
    const fileId = await this.provider.uploadFile(file);
    const fileUrl = await this.provider.getFileUrl(fileId);
    const { title, summary } = await this.provider.analyzeDocument(
      fileUrl,
      file.originalname,
    );
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
    curationItemIds: string[] = [],
    userId?: string,
  ): Promise<{
    title: string;
    content: string;
    tags: string[];
    references: string[];
    tokensUsed: number;
  }> {
    try {
      let curationContext: {
        title: string;
        summary?: string;
        sourceName?: string;
      }[] = [];

      if (curationItemIds.length && userId) {
        const items = await this.curationItemService.findByIds(
          curationItemIds,
          userId,
        );
        curationContext = items.map((item) => ({
          title: item.title,
          summary: item.summary,
          sourceName: item.source?.name,
        }));
      }

      return await this.provider.generatePost(
        platform,
        subject,
        tone,
        length,
        curationContext,
      );
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

  async analyzeSeo(contentId: string): Promise<{
    score: number;
    keywords: string;
    review: string;
    tokensUsed: number;
  }> {
    const content = await this.contentService.findOne(contentId);

    if (!content) {
      throw new NotFoundException(`Contenu ${contentId} introuvable`);
    }

    try {
      const result = await this.provider.analyzeSeo(
        content.contentPlatform,
        content.title,
        content.body,
      );

      await this.contentService.updateSeo(contentId, {
        score: result.score,
        keywords: result.keywords,
        review: result.review,
      });

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de l'analyse SEO : ${error.message}`,
      );
    }
  }
}
