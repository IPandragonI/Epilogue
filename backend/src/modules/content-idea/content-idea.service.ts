import { Injectable } from '@nestjs/common';
import { CreateContentIdeaDto } from './dto/create-content-idea.dto';
import { UpdateContentIdeaDto } from './dto/update-content-idea.dto';
import { ContentIdea } from './entities/content-idea.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ContentIdeaService {

    constructor(
      @InjectRepository(ContentIdea)
      private contentIdeaRepository: Repository<ContentIdea>) {
    }


  create(createContentIdeaDto: CreateContentIdeaDto) {
    return this.contentIdeaRepository.save(createContentIdeaDto);
  }

  findAll() {
    return this.contentIdeaRepository.find();
  }

  findOne(id: string) {
    return this.contentIdeaRepository.findOne({ where: { id } });
  }

  update(id: string, updateContentIdeaDto: UpdateContentIdeaDto) {
    return this.contentIdeaRepository.update(id, updateContentIdeaDto);
  }

  remove(id: string) {
    return this.contentIdeaRepository.delete(id);
  }
}
