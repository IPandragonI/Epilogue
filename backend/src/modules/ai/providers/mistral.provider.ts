import {
  AIProvider,
} from '../interfaces/ai-provider.interface';
import { postJSON } from '../utils/http';
import { MistralResponse } from '../interfaces/ai-responses.interface';
import { InternalServerErrorException } from '@nestjs/common';
import { PromptService } from '../prompt.service';
import { PlatformEnum } from '../../suggested-topic/entities/platform.enum';
import {
  GeneratedSuggestedTopic,
  SuggestedTopicGenerationContext,
} from '../../suggested-topic/interfaces/suggested-topic-generation.interface';

export class MistralProvider implements AIProvider {
  constructor(private readonly promptService: PromptService) {}

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

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const formData = new FormData();

    const buffer = file.buffer;
    const uint8copy = new Uint8Array(buffer.byteLength);
    uint8copy.set(buffer as any, 0);
    const blob = new Blob([uint8copy], { type: file.mimetype });
    formData.append('file', blob, file.originalname);
    formData.append('purpose', 'ocr'); // 'ocr' pour l'extraction de contenu

    const response = await fetch(`https://api.mistral.ai/v1/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new InternalServerErrorException(
        `Mistral file upload failed: ${error}`,
      );
    }

    const data = await response.json();
    return data.id;
  }

  async getFileUrl(fileId: string): Promise<string> {
    const response = await fetch(
      `https://api.mistral.ai/v1/files/${fileId}/url`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
      },
    );

    if (!response.ok) {
      throw new InternalServerErrorException(
        'Failed to get Mistral signed URL',
      );
    }

    const data = await response.json();
    return data.url;
  }

  async analyzeDocument(
    signedUrl: string,
    originalName: string,
  ): Promise<{ title: string; summary: string }> {
    const systemPrompt = this.promptService.getPrompt('analyse-document');

    const response = await fetch(`https://api.mistral.ai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'document_url',
                document_url: signedUrl,
              },
              {
                type: 'text',
                text: `Le nom du fichier original est : "${originalName}"`,
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new InternalServerErrorException(
        `Mistral analysis failed: ${error}`,
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      return JSON.parse(content);
    } catch {
      throw new InternalServerErrorException(
        'Failed to parse Mistral response as JSON',
      );
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    //delete the file from the provider after analysis
    await fetch(`https://api.mistral.ai/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
    });
  }

  async generateTextFromWebContent(
    content: string,
  ): Promise<{ title: string; summary: string }> {
    const systemPrompt = this.promptService.getPrompt('analyse-scrapping');

    const response: MistralResponse = await postJSON<MistralResponse>(
      `https://api.mistral.ai/v1/chat/completions`,
      {
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: content,
              },
            ],
          },
        ],
      },
      {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
    );

    const raw = response.choices[0].message.content as string;

    const cleaned = raw
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    return JSON.parse(cleaned);
  }

  async generatePost(
    platform: string,
    subject: string,
    tone: string,
    length: string,
  ): Promise<{
    title: string;
    content: string;
    tags: string[];
    references: string[];
  }> {
    const systemPrompt = this.promptService.getPrompt('generate-post');
    const lengthConfig = getLengthConfig(platform, length);

    const maxTokens = Math.min(Math.ceil(lengthConfig.maxWords * 1.6) + 400, 8000,);

    const response: MistralResponse = await postJSON<MistralResponse>(
      `https://api.mistral.ai/v1/chat/completions`,
      {
        model: 'mistral-small-latest',
        response_format: { type: 'json_object' },
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Platform: ${platform}\nSubject: ${subject}\nTone: ${tone}\nLength: ${lengthConfig.instruction}`,
              },
            ],
          },
        ],
      },
      { Authorization: `Bearer ${process.env.MISTRAL_API_KEY}` },
    );

    const parsed = JSON.parse(response.choices[0].message.content as string);
    const content = truncateHtmlByWords(
      parsed.content ?? '',
      lengthConfig.maxWords,
    );

    return {
      title: parsed.title ?? '',
      content,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      references: Array.isArray(parsed.references) ? parsed.references : [],
    };
  }

  async generateSuggestedTopics(
    terms: string,
    context: SuggestedTopicGenerationContext,
  ): Promise<GeneratedSuggestedTopic[]> {
    const systemPrompt = this.promptService.getPrompt('suggest-theme');
    const targetCount = getSuggestedTopicCount(terms);

    const response: MistralResponse = await postJSON<MistralResponse>(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-small-latest',
        response_format: { type: 'json_object' },
        max_tokens: 1800,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    terms,
                    targetCount,
                    curationItems: context.curationItems,
                    contentHistory: context.contentHistory,
                    existingTopics: context.existingTopics,
                  },
                  null,
                  2,
                ),
              },
            ],
          },
        ],
      },
      { Authorization: `Bearer ${process.env.MISTRAL_API_KEY}` },
    );

    const parsed = JSON.parse(cleanJsonResponse(response.choices[0].message.content));
    const ideas = Array.isArray(parsed?.ideas) ? parsed.ideas : [];
    const normalizedIdeas = normalizeGeneratedSuggestedTopics(ideas);

    if (!normalizedIdeas.length) {
      throw new InternalServerErrorException(
        'Failed to generate valid suggested topics',
      );
    }

    return normalizedIdeas.slice(0, targetCount);
  }
}

interface LengthConfig {
  instruction: string;
  minWords: number;
  maxWords: number;
}

type PlatformLengthMap = Record<string, Record<string, LengthConfig>>;

const PLATFORM_LENGTH_MAP: PlatformLengthMap = {
  linkedin: {
    court: {
      instruction: 'court : entre 80 et 120 mots',
      minWords: 80,
      maxWords: 120,
    },
    moyen: {
      instruction: 'moyen : entre 150 et 250 mots',
      minWords: 150,
      maxWords: 250,
    },
    long: {
      instruction: 'long : entre 300 et 400 mots',
      minWords: 300,
      maxWords: 400,
    },
  },
  twitter: {
    court: {
      instruction: 'très court : entre 15 et 25 mots',
      minWords: 15,
      maxWords: 25,
    },
    moyen: {
      instruction: 'court : entre 25 et 35 mots',
      minWords: 25,
      maxWords: 35,
    },
    long: {
      instruction: 'maximum : entre 35 et 45 mots',
      minWords: 35,
      maxWords: 45,
    },
  },
  instagram: {
    court: {
      instruction: 'court : entre 40 et 60 mots',
      minWords: 40,
      maxWords: 60,
    },
    moyen: {
      instruction: 'moyen : entre 80 et 120 mots',
      minWords: 80,
      maxWords: 120,
    },
    long: {
      instruction: 'long : entre 130 et 180 mots',
      minWords: 130,
      maxWords: 180,
    },
  },
  blog: {
    court: {
      instruction: 'court : entre 500 et 1000 mots',
      minWords: 500,
      maxWords: 1000,
    },
    moyen: {
      instruction: 'moyen : entre 1500 et 2500 mots',
      minWords: 1500,
      maxWords: 2500,
    },
    long: {
      instruction: 'long : entre 4000 et 5500 mots',
      minWords: 4000,
      maxWords: 5500,
    },
  },
};

const DEFAULT_PLATFORM = 'linkedin';
const DEFAULT_LENGTH = 'moyen';

function getLengthConfig(platform: string, length: string): LengthConfig {
  const platformMap =
    PLATFORM_LENGTH_MAP[platform.toLowerCase()] ??
    PLATFORM_LENGTH_MAP[DEFAULT_PLATFORM];
  return platformMap[length] ?? platformMap[DEFAULT_LENGTH];
}

function truncateHtmlByWords(html: string, maxWords: number): string {
  const wordMargin = Math.ceil(maxWords * 1.1);

  let wordCount = 0;
  let result = '';
  const tagStack: string[] = [];

  const tokens = html.match(/<[^>]+>|[^<]+/g) || [];

  for (const token of tokens) {
    if (wordCount >= wordMargin) break;

    if (token.startsWith('<')) {
      const isClosing = token.startsWith('</');
      const isSelfClosing = token.endsWith('/>');
      const tagName = token.match(/^<\/?([a-z0-9]+)/i)?.[1]?.toLowerCase();

      if (!tagName) continue;

      if (isClosing) {
        const idx = tagStack.lastIndexOf(tagName);
        if (idx !== -1) tagStack.splice(idx, 1);
      } else if (!isSelfClosing) {
        tagStack.push(tagName);
      }

      result += token;
    } else {
      const parts = token.match(/\S+|\s+/g) || [];
      for (const part of parts) {
        if (/\S/.test(part)) {
          if (wordCount >= wordMargin) break;
          wordCount++;
        }
        result += part;
      }
    }
  }

  for (let i = tagStack.length - 1; i >= 0; i--) {
    result += `</${tagStack[i]}>`;
  }

  return result.trim();
}

function cleanJsonResponse(content: unknown): string {
  return String(content ?? '')
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();
}

function getSuggestedTopicCount(terms: string): number {
  const tokenCount = terms
    .split(/[\s,;|/]+/)
    .map((token) => token.trim())
    .filter(Boolean).length;

  if (tokenCount >= 8) return 1;
  if (tokenCount >= 4) return 2;
  return 3;
}

function normalizeGeneratedSuggestedTopics(
  ideas: unknown[],
): GeneratedSuggestedTopic[] {
  const seenTopics = new Set<string>();

  return ideas
    .map((idea) => {
      const topic = truncatePlainText((idea as any)?.topic, 255);
      const topicDescription = truncatePlainText(
        (idea as any)?.topicDescription,
        2000,
      );
      const recommendedPlatform = normalizePlatform(
        (idea as any)?.recommendedPlatform,
      );

      if (!topic || !topicDescription || !recommendedPlatform) {
        return null;
      }

      const normalizedKey = topic.toLowerCase();

      if (seenTopics.has(normalizedKey)) {
        return null;
      }

      seenTopics.add(normalizedKey);

      return {
        topic,
        topicDescription,
        recommendedPlatform,
      };
    })
    .filter((idea): idea is GeneratedSuggestedTopic => idea !== null);
}

function truncatePlainText(value: unknown, maxLength: number): string {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function normalizePlatform(value: unknown): PlatformEnum | null {
  const normalizedValue = String(value ?? '').trim().toUpperCase();

  switch (normalizedValue) {
    case PlatformEnum.BLOG:
      return PlatformEnum.BLOG;
    case PlatformEnum.LINKEDIN:
      return PlatformEnum.LINKEDIN;
    case PlatformEnum.TWITTER:
      return PlatformEnum.TWITTER;
    case PlatformEnum.INSTAGRAM:
      return PlatformEnum.INSTAGRAM;
    default:
      return null;
  }
}
