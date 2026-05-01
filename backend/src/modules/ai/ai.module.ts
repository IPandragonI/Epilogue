// ai/ai.module.ts
import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIProviderFactory } from './ai.provider';
import { AIController } from './ai.controller';
import { PromptService } from './prompt.service';
import { DocumentService } from './document/document.service';

@Module({
  controllers: [AIController],
  providers: [AIService, AIProviderFactory, PromptService, DocumentService],
  exports: [AIService],
})
export class AiModule {}
