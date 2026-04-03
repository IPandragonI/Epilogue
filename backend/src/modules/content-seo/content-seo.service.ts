import { Injectable } from '@nestjs/common';
import { CreateContentSeoDto } from './dto/create-content-seo.dto';
import { UpdateContentSeoDto } from './dto/update-content-seo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentSeo } from './entities/content-seo.entity';

@Injectable()
export class ContentSeoService {
  constructor(
    @InjectRepository(ContentSeo)
    private contentSeoRepository: Repository<ContentSeo>,
  ) {}

  create(createContentSeoDto: CreateContentSeoDto) {
    return this.contentSeoRepository.save(createContentSeoDto);
  }

  findAll() {
    return this.contentSeoRepository.find();
  }
}
