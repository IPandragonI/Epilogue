import { MistralProvider } from './providers/mistral.provider';
import { PromptService } from './prompt.service';

export const AI_PROVIDER = 'AI_PROVIDER';

export const AIProviderFactory = {
    provide: AI_PROVIDER,
    useFactory: (promptService: PromptService) => {
        const provider = process.env.AI_PROVIDER;

        switch (provider) {
            case 'mistral':
                return new MistralProvider(promptService);
            default:
                throw new Error(`Unsupported AI provider: ${provider}`);
        }
    },
    inject: [PromptService],
};