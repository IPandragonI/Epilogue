import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AIService } from './ai.service';
import { GenerateTextDto } from './dto/generate-text.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DocumentService } from './document/document.service';
import type { FastifyRequest } from 'fastify';

@Controller('ai')
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly documentService: DocumentService,
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

  @Post('upload')
  async upload(@Req() req: FastifyRequest) {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request must be multipart/form-data');
    }

    const data = await req.file();

    if (!data) {
      throw new BadRequestException('No file provided');
    }

    // Validation du type MIME
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

    // Convertir le stream en buffer
    const buffer = await data.toBuffer();

    // Validation de la taille (10MB)
    if (buffer.length > 20 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Construire un objet compatible avec ce qu'attend ton DocumentService
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
