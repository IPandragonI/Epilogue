import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from './ai.provider';
import * as aiProviderInterface from './interfaces/ai-provider.interface';
import { PromptService } from './prompt.service';

@Injectable()
export class AIService {
    constructor(
        @Inject(AI_PROVIDER)
        private readonly provider: aiProviderInterface.AIProvider,
        private readonly promptService: PromptService,
    ) {}

    async generateText(prompt: string, template?: string): Promise<string> {
        const systemPrompt = template
            ? this.promptService.getPrompt(template)
            : '';

        const finalPrompt = `
        ${systemPrompt}
        
        Utilisateur : 
        ${prompt}`
        return this.provider.generateText(finalPrompt);
    }
}