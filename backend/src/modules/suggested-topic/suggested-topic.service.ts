import { Injectable } from '@nestjs/common';
import { CreateSuggestedTopicDto } from './dto/create-suggested-topic.dto';
import { UpdateSuggestedTopicDto } from './dto/update-suggested-topic.dto';
import { SuggestedTopic } from './entities/suggested-topic.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SuggestedTopicService {

    constructor(
      @InjectRepository(SuggestedTopic)
      private suggestedTopicRepository: Repository<SuggestedTopic>) {
    }


  create(createContentIdeaDto: CreateSuggestedTopicDto) {
    return this.suggestedTopicRepository.save(createContentIdeaDto);
  }

  findAll() {
    return this.suggestedTopicRepository.find();
  }

  findOne(id: string) {
    return this.suggestedTopicRepository.findOne({ where: { id } });
  }

  update(id: string, updateContentIdeaDto: UpdateSuggestedTopicDto) {
    return this.suggestedTopicRepository.update(id, updateContentIdeaDto);
  }

  remove(id: string) {
    return this.suggestedTopicRepository.delete(id);
  }
}
