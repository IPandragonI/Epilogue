export interface AIProvider {
    generateText(prompt: string, options?:any): Promise<string>;
}