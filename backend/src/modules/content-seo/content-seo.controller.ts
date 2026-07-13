import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ContentSeoService } from './content-seo.service';
import { CreateContentSeoDto } from './dto/create-content-seo.dto';
import { UpdateContentSeoDto } from './dto/update-content-seo.dto';
import { JwtAuthGuard } from '../../auth/guards/auth.guards';

@UseGuards(JwtAuthGuard)
@Controller('content-seo')
export class ContentSeoController {
  constructor(private readonly contentSeoService: ContentSeoService) {}

  @Post()
  create(@Body() createContentSeoDto: CreateContentSeoDto) {
    return this.contentSeoService.create(createContentSeoDto);
  }

  @Get()
  findAll() {
    return this.contentSeoService.findAll();
  }
}
