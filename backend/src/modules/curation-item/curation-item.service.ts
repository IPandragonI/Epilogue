import { Injectable } from '@nestjs/common';
import { CreateCurationItemDto } from './dto/create-curation-item.dto';
import { UpdateCurationItemDto } from './dto/update-curation-item.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CurationItem } from './entities/curation-item.entity';

@Injectable()
export class CurationItemService {
  constructor(
    @InjectRepository(CurationItem)
    private curationItemRepository: Repository<CurationItem>) {
  }

  create(createCurationItemDto: CreateCurationItemDto) {
    return this.curationItemRepository.save(createCurationItemDto);
  }

  findAll() {
    return this.curationItemRepository.find();
  }

  findOne(id: string) {
    return this.curationItemRepository.findOneBy({ id });
  }

  update(id: string, updateCurationItemDto: UpdateCurationItemDto) {
    return this.curationItemRepository.update(id, updateCurationItemDto);
  }

  remove(id: string) {
    return this.curationItemRepository.delete(id);
  }
}
