import {
  GeneratedSuggestedTopic,
  SuggestedTopicGenerationContext,
} from '../../suggested-topic/interfaces/suggested-topic-generation.interface';

export interface AIProvider {
  generateText(prompt: string): Promise<string>;
  uploadFile(file: Express.Multer.File): Promise<string>;
  getFileUrl(fileId: string): Promise<string>;
  analyzeDocument(
    fileUrl: string,
    fileName: string,
  ): Promise<{ title: string; summary: string }>;
  deleteFile(fileId: string): Promise<void>;
  generateTextFromWebContent(
    content: string,
  ): Promise<{ title: string; summary: string }>;

  generatePost(
    platform: string,
    subject: string,
    tone: string,
    length: string,
    curationContext?: {
      title: string;
      summary?: string;
      sourceName?: string;
    }[],
  ): Promise<{
    title: string;
    content: string;
    tags: string[];
    references: string[];
  }>;

  generateSuggestedTopics(
    terms: string,
    context: SuggestedTopicGenerationContext,
  ): Promise<GeneratedSuggestedTopic[]>;
}
