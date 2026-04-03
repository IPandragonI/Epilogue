// ai/ai.module.ts
import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIProviderFactory } from './ai.provider';
import { AIController } from "./ai.controller";

@Module({
    controllers: [AIController],
    providers: [AIService, AIProviderFactory],
    exports: [AIService],
})
export class AiModule {}