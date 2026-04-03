import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContentNotionService } from './content-notion.service';
import { CreateContentNotionDto } from './dto/create-content-notion.dto';
@Controller('content-notion')
export class ContentNotionController {
  constructor(private readonly contentNotionService: ContentNotionService) {}

  @Post()
  create(@Body() createContentNotionDto: CreateContentNotionDto) {
    return this.contentNotionService.create(createContentNotionDto);
  }

  @Get()
  findAll() {
    return this.contentNotionService.findAll();
  }
}
