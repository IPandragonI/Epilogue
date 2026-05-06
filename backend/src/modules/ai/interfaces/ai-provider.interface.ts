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
}
