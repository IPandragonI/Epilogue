import { Injectable } from '@nestjs/common';
import { CreateContentNotionDto } from './dto/create-content-notion.dto';
import { UpdateContentNotionDto } from './dto/update-content-notion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ContentSeo } from '../content-seo/entities/content-seo.entity';
import { Repository } from 'typeorm';
import { ContentNotion } from './entities/content-notion.entity';

@Injectable()
export class ContentNotionService {
  constructor(
    @InjectRepository(ContentNotion)
    private contentNotionRepository: Repository<ContentNotion>,
  ) {}

  create(createContentNotionDto: CreateContentNotionDto) {
    return this.contentNotionRepository.save(createContentNotionDto);
  }

  findAll() {
    return this.contentNotionRepository.find();
  }
}
