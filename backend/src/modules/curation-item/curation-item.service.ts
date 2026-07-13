import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createCurationItemDto: CreateCurationItemDto, userId: string) {
    const sourceSaved = await this.curationSourceRepository.save(
      createCurationItemDto.source,
    );

    const toSave: any = {
      title: String(createCurationItemDto.title),
      summary: String(createCurationItemDto.summary),
      user: { id: userId },
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

  async findOne(id: string, userId: string) {
    const item = await this.curationItemRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['source', 'user'],
    });

    if (!item) {
      throw new NotFoundException(`Curation item with id ${id} not found`);
    }

    return item;
  }

  async update(
    id: string,
    updateCurationItemDto: UpdateCurationItemDto,
    userId: string,
  ) {
    await this.findOne(id, userId);
    const { title, summary } = updateCurationItemDto;
    return this.curationItemRepository.update(
      { id, user: { id: userId } },
      { title, summary },
    );
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.curationItemRepository.delete({ id, user: { id: userId } });
  }
}
