import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { AI_PROVIDER } from './ai.provider';
import * as aiProviderInterface from './interfaces/ai-provider.interface';
import { ScrappingService } from './scrapping.service';

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
}

