// ai/ai.module.ts
import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIProviderFactory } from './ai.provider';
import { AIController } from './ai.controller';
import { PromptService } from './prompt.service';
import { ScrappingService } from './scrapping.service';

@Module({
  controllers: [AIController],
  providers: [
    AIService,
    AIProviderFactory,
    PromptService,
    ScrappingService,
  ],
  exports: [AIService],
})
export class AiModule {}
