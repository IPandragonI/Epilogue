import { Injectable } from '@nestjs/common';
import { CreateCurationItemDto } from './dto/create-curation-item.dto';
import { UpdateCurationItemDto } from './dto/update-curation-item.dto';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CurationItem } from './entities/curation-item.entity';
import { CurationSource } from '../curation-source/entities/curation-source.entity';

@Injectable()
export class CurationItemService {
  constructor(
    @InjectRepository(CurationItem)
    private curationItemRepository: Repository<CurationItem>,
    @InjectRepository(CurationSource)
    private curationSourceRepository: Repository<CurationSource>,
  ) {}

  async create(createCurationItemDto: CreateCurationItemDto) {
    const sourceSaved = await this.curationSourceRepository.save(
      createCurationItemDto.source,
    );

    const toSave: any = {
      title: String(createCurationItemDto.title),
      summary: String(createCurationItemDto.summary),
      user: { id: String(createCurationItemDto.userId) },
      source: sourceSaved,
    };

    return this.curationItemRepository.save(toSave);
  }

  findAllByUser(userId: string) {
    return this.curationItemRepository.find({
      where: { user: { id: userId } },
      relations: ['source'],
      order: { lastFetchedAt: 'DESC' },
    });
  }

  findByIds(ids: string[], userId: string) {
    if (!ids.length) return Promise.resolve([]);
    return this.curationItemRepository.find({
      where: { id: In(ids), user: { id: userId } },
      relations: ['source'],
    });
  }

  findAll() {
    return this.curationItemRepository.find({
      relations: ['source', 'user'],
      order: { source: { createdAt: 'DESC' } },
    });
  }

  findOne(id: string) {
    return this.curationItemRepository.findOne({
      where: { id },
      relations: ['source', 'user'],
    });
  }

  update(id: string, updateCurationItemDto: UpdateCurationItemDto) {
    return this.curationItemRepository.update(id, updateCurationItemDto);
  }

  remove(id: string) {
    return this.curationItemRepository.delete(id);
  }
}
