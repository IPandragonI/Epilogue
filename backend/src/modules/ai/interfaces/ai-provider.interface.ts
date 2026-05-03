export interface AIProvider {
  generateText(prompt: string, options?: any): Promise<string>;
  uploadFileToMistral(file: Express.Multer.File): Promise<string>;
  getMistralSignedUrl(fileId: string): Promise<string>;
  analyzeWithMistral(
    signedUrl: string,
    fileName: string,
  ): Promise<{ title: string; summary: string }>;
  removeFileFromMistral(fileId: string): Promise<void>;
  generateTextFromWebSite(
    content: string,
  ): Promise<{ title: string; summary: string }>;
}
