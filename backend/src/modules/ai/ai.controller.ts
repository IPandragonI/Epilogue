import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import { AIService } from './ai.service';
import { GenerateTextDto } from './dto/generate-text.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DocumentService } from './document/document.service';
import type { FastifyRequest } from 'fastify';
import * as cheerio from 'cheerio';
import { ScrappingService } from './document/scrapping.service';

@Controller('ai')
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly documentService: DocumentService,
    private readonly scrappingService: ScrappingService,
  ) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Generate text using AI',
    description: 'Generate text based on the provided prompt.',
  })
  @ApiResponse({ status: 200, description: 'Text generated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async generateText(@Body() body: GenerateTextDto) {
    const result = await this.aiService.generateText(
      body.prompt,
      body.template,
    );

    return {
      success: true,
      data: result,
    };
  }

  @Post('generate-from-website')
  async generateTextFromWebSite(@Body('url') url: string) {
    if (!url) {
      throw new BadRequestException('URL is required');
    }

    const content = await this.scrappingService.scrapeUrl(url);

    const result = await this.documentService.generateTextFromWebSite(
      content.content,
    );

    return { success: true, data: result };
  }

  @Post('upload')
  async upload(@Req() req: FastifyRequest) {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request must be multipart/form-data');
    }

    const data = await req.file();

    if (!data) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(data.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${data.mimetype}. Allowed: ${allowedMimeTypes.join(', ')}`,
      );
    }

    const buffer = await data.toBuffer();

    if (buffer.length > 20 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    const file: Express.Multer.File = {
      buffer,
      originalname: data.filename,
      mimetype: data.mimetype,
      size: buffer.length,
      fieldname: data.fieldname,
      encoding: data.encoding,
      stream: null as any,
      destination: '',
      filename: data.filename,
      path: '',
    };

    return this.documentService.uploadAndAnalyze(file);
  }
}
