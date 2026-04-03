import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from './ai.provider';
import * as aiProviderInterface from './interfaces/ai-provider.interface';

@Injectable()
export class AIService {
    constructor(
        @Inject(AI_PROVIDER)
        private readonly provider: aiProviderInterface.AIProvider,
    ) {}

    async generateText(prompt: string) {
        return this.provider.generateText(prompt);
    }
}