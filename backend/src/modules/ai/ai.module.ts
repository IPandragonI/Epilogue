// ai/ai.module.ts
import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIProviderFactory } from './ai.provider';
import { AIController } from './ai.controller';
import { PromptService } from './prompt.service';
import { DocumentService } from './document/document.service';
import { ScrappingService } from './document/scrapping.service';

@Module({
  controllers: [AIController],
  providers: [
    AIService,
    AIProviderFactory,
    PromptService,
    DocumentService,
    ScrappingService,
  ],
  exports: [AIService],
})
export class AiModule {}
