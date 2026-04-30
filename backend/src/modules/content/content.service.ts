import { Injectable } from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { Content } from './entities/content.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';

@Injectable()
export class ContentService {

  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>) {
  }

  create(createContentDto: CreateContentDto) {
    return this.contentRepository.save(createContentDto);
  }

  findAll() {
    return this.contentRepository.find();
  }

  findAllWithSEO() {
    return this.contentRepository.find({ relations: ['seo'] });
  }

  async findAllWithSeoPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<Content>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.contentRepository.findAndCount({
      relations: ['seo'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
    });

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        limit,
      },
    };
  }

  findOne(id: string) {
    return this.contentRepository.findOne({ where: { id } });
  }

  update(id: string, updateContentDto: UpdateContentDto) {
    return this.contentRepository.update(id, updateContentDto);
  }

  remove(id: string) {
    return this.contentRepository.delete(id);
  }
}
