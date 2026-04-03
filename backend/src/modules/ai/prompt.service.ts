import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class PromptService {
    private readonly cache = new Map<string, string>();

    getPrompt(name: string): string {
        if (this.cache.has(name)) {
            return this.cache.get(name)!;
        }

        const filePath = path.join(
            process.cwd(),
            'src/ai/prompts',
            `${name}.system.txt`,
        );

        const content = fs.readFileSync(filePath, 'utf-8');

        this.cache.set(name, content);

        return content;
    }
}