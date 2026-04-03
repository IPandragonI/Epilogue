import { AIProvider } from '../interfaces/ai-provider.interface';
import { postJSON } from "../utils/http";
import { MistralResponse } from "../interfaces/ai-responses.interface";

export class MistralProvider implements AIProvider {
    async generateText(prompt: string): Promise<string> {
        const data: MistralResponse = await postJSON<MistralResponse>(
            'https://api.mistral.ai/v1/chat/completions',
            {
                model: 'mistral-small',
                messages: [{ role: 'user', content: prompt }],
            },
            {
                Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
            },
        );

        return data.choices[0].message.content;
    }
}