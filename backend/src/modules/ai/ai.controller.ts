import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import { AIService } from './ai.service';
import { GenerateTextDto } from './dto/generate-text.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';

@ApiTags('AI')
@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Générer du texte',
    description: 'Envoie un prompt au modèle IA et retourne le texte généré.',
  })
  @ApiResponse({ status: 201, description: 'Texte généré avec succès.' })
  @ApiResponse({ status: 400, description: 'Paramètres invalides.' })
  async generateText(@Body() body: GenerateTextDto) {
    const result = await this.aiService.generateText(body.prompt);
    return { success: true, data: result };
  }

  @Post('generate-from-website')
  @ApiOperation({
    summary: 'Analyser une page web',
    description:
      "Scrape le contenu d'une URL et génère un titre et un résumé via l'IA.",
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['url'],
      properties: {
        url: {
          type: 'string',
          format: 'uri',
          example: 'https://example.com/article',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Titre et résumé générés avec succès.',
    schema: {
      example: { success: true, data: { title: 'Titre', summary: 'Résumé...' } },
    },
  })
  @ApiResponse({ status: 400, description: "L'URL est requise." })
  @ApiResponse({ status: 502, description: 'Échec du scraping de la page.' })
  async generateTextFromWebSite(@Body('url') url: string) {
    if (!url) {
      throw new BadRequestException('URL is required');
    }

    const result = await this.aiService.generateTextFromWebContent(url);
    return { success: true, data: result };
  }

  @Post('upload')
  @ApiOperation({
    summary: 'Analyser un document',
    description:
      "Upload un fichier (PDF ou image) vers l'IA et retourne un titre et un résumé extraits du document.",
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Fichier PDF, JPEG, PNG ou WEBP (max 20 Mo)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document analysé avec succès.',
    schema: {
      example: {
        success: true,
        data: { title: 'Titre', summary: 'Résumé...', fileName: 'doc.pdf' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Fichier manquant, type non supporté ou taille dépassée.' })
  @ApiResponse({ status: 500, description: "Erreur lors de l'analyse par l'IA." })
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

    return this.aiService.analyzeDocument(file);
  }
}
