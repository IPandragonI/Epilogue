import { Injectable } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TopicService {

  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>) {
  }

  create(createTopicDto: CreateTopicDto) {
    return this.topicRepository.save(createTopicDto as Topic);
  }

  findAll() {
    return this.topicRepository.find();
  }

  findOne(id: string) {
    return this.topicRepository.findOne({ where: { id } });
  }

  update(id: string, updateTopicDto: UpdateTopicDto) {
    return this.topicRepository.update(id, updateTopicDto);
  }

  remove(id: string) {
    return this.topicRepository.delete(id);
  }
}
