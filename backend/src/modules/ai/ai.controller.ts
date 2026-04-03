import { Body, Controller, Post } from '@nestjs/common';
import { AIService } from './ai.service';
import { GenerateTextDto } from './dto/generate-text.dto';
import {ApiOperation, ApiResponse} from "@nestjs/swagger";

@Controller('ai')
export class AIController {
    constructor(private readonly aiService: AIService) {}

    @Post('generate')
    @ApiOperation({ summary: 'Generate text using AI', description: 'Generate text based on the provided prompt.' })
    @ApiResponse({ status: 200, description: 'Text generated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid input.' })
    async generateText(@Body() body: GenerateTextDto) {
        const result = await this.aiService.generateText(body.prompt);

        return {
            success: true,
            data: result,
        };
    }
}