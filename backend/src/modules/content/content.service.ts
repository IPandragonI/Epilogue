import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { Content } from './entities/content.entity';
import { ContentStatusEnum } from './entities/contentStatus.enum';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { ContentSeoService } from '../content-seo/content-seo.service';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    private readonly contentSeoService: ContentSeoService,
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

  findAllWithNotion() {
    return this.contentRepository.find({
      relations: ['notion'],
      order: { createdAt: 'DESC' },
    });
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
    const [total, published, draft, waitingPublish, byPlatformRaw, avgSeoRaw] =
      await Promise.all([
        this.contentRepository.count(),
        this.contentRepository.count({
          where: { status: ContentStatusEnum.PUBLISHED },
        }),
        this.contentRepository.count({
          where: { status: ContentStatusEnum.DRAFT },
        }),
        this.contentRepository.count({
          where: { status: ContentStatusEnum.WAITING_PUBLISH },
        }),
        this.contentRepository
          .createQueryBuilder('c')
          .select('c.contentPlatform', 'platform')
          .addSelect('COUNT(*)', 'count')
          .groupBy('c.contentPlatform')
          .getRawMany<{ platform: string; count: string }>(),
        this.contentRepository
          .createQueryBuilder('c')
          .leftJoin('c.seo', 'seo')
          .select('AVG(seo.score)', 'avg')
          .getRawOne<{ avg: string | null }>(),
      ]);

    const byPlatform = { BLOG: 0, LINKEDIN: 0, TWITTER: 0, INSTAGRAM: 0 };
    for (const row of byPlatformRaw) {
      if (row.platform in byPlatform) {
        byPlatform[row.platform as keyof typeof byPlatform] = Number(row.count);
      }
    }

    return {
      total,
      published,
      draft,
      waitingPublish,
      avgSeoScore: Math.round(Number(avgSeoRaw?.avg ?? 0) * 10) / 10,
      byPlatform,
    };
  }

  async updateSeo(
    contentId: string,
    seoData: { score: number; keywords: string; review: string },
  ): Promise<Content> {
    const content = await this.contentRepository.findOne({
      where: { id: contentId },
      relations: ['seo'],
    });

    if (!content) {
      throw new NotFoundException(`Content with id ${contentId} not found`);
    }

    if (content.seo) {
      await this.contentSeoService.update(content.seo.id, seoData);
    } else {
      const seo = await this.contentSeoService.create(seoData);
      content.seo = seo;
      await this.contentRepository.save(content);
    }

    return this.findOne(contentId) as Promise<Content>;
  }

  update(id: string, updateContentDto: UpdateContentDto) {
    return this.contentRepository.update(id, updateContentDto);
  }

  remove(id: string) {
    return this.contentRepository.delete(id);
  }
}
