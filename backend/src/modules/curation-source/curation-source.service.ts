import { Injectable } from '@nestjs/common';
import { CreateCurationSourceDto } from './dto/create-curation-source.dto';
import { UpdateCurationSourceDto } from './dto/update-curation-source.dto';
import { CurationSource } from './entities/curation-source.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CurationSourceService {

    constructor(
      @InjectRepository(CurationSource)
      private curationSourceRepository: Repository<CurationSource>) {
    }

  create(createCurationSourceDto: CreateCurationSourceDto) {
    return this.curationSourceRepository.save(createCurationSourceDto);
  }

  findAll() {
    return `This action returns all curationSource`;
  }

  findOne(id: number) {
    return `This action returns a #${id} curationSource`;
  }

  update(id: number, updateCurationSourceDto: UpdateCurationSourceDto) {
    return `This action updates a #${id} curationSource`;
  }

  remove(id: number) {
    return `This action removes a #${id} curationSource`;
  }
}
