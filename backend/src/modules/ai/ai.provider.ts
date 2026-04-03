import { MistralProvider } from './providers/mistral.provider';

export const AI_PROVIDER = 'AI_PROVIDER';

export const AIProviderFactory = {
    provide: AI_PROVIDER,
    useFactory: () => {
        const provider = process.env.AI_PROVIDER;

        switch (provider) {
            case 'mistral':
                return new MistralProvider();
            default:
                throw new Error(`Unsupported AI provider: ${provider}`);
        }
    },
};