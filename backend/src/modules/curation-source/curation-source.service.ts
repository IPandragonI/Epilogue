import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCurationSourceDto } from './dto/create-curation-source.dto';
import { UpdateCurationSourceDto } from './dto/update-curation-source.dto';
import { CurationSource } from './entities/curation-source.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CurationSourceService {
  constructor(
    @InjectRepository(CurationSource)
    private curationSourceRepository: Repository<CurationSource>,
  ) {}

  create(createCurationSourceDto: CreateCurationSourceDto) {
    return this.curationSourceRepository.save(createCurationSourceDto);
  }

  findAll() {
    return this.curationSourceRepository.find();
  }

  async findOne(id: string) {
    const source = await this.curationSourceRepository.findOne({
      where: { id },
    });

    if (!source) {
      throw new NotFoundException(`Curation source with id ${id} not found`);
    }

    return source;
  }

  async update(id: string, updateCurationSourceDto: UpdateCurationSourceDto) {
    await this.findOne(id);
    await this.curationSourceRepository.update(id, updateCurationSourceDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.curationSourceRepository.delete(id);
  }
}
