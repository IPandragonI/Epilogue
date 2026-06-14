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
    private contentRepository: Repository<Content>,
  ) {}

  create(createContentDto: CreateContentDto) {
    return this.contentRepository.save(createContentDto);
  }

  findAll() {
    return this.contentRepository.find();
  }

  findAllWithSEO() {
    return this.contentRepository.find({ relations: ['seo'] });
  }

  async findAllWithSeoPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Content>> {
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
    return this.contentRepository.findOne({
      where: { id },
      relations: ['seo', 'notion'],
    });
  }

  async getStats() {
    const [totalContent, [contents, count]] = await Promise.all([
      this.contentRepository.count(),
      this.contentRepository.findAndCount({
        relations: ['seo'],
      }),
    ]);

    const totalSeoScore = contents.reduce((sum, content) => {
      return sum + (content.seo ? content.seo.score : 0);
    }, 0);

    const averageSeoScore = count > 0 ? totalSeoScore / count : 0;
    const remainingIAToken = 0;

    return [
      { label: 'Total contenus', value: String(totalContent) },
      { label: 'Score SEO moyen', value: averageSeoScore.toFixed(1) },
      { label: 'Crédits IA restant', value: String(remainingIAToken) },
    ];
  }

  update(id: string, updateContentDto: UpdateContentDto) {
    return this.contentRepository.update(id, updateContentDto);
  }

  remove(id: string) {
    return this.contentRepository.delete(id);
  }
}
