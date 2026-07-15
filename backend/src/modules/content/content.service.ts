import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { Content } from './entities/content.entity';
import { ContentStatusEnum } from './entities/contentStatus.enum';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { ContentSeoService } from '../content-seo/content-seo.service';

const AUTHOR_SELECT = {
  id: true,
  firstname: true,
  lastname: true,
  avatarUrl: true,
} as const;

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    private readonly contentSeoService: ContentSeoService,
  ) {}

  private scopeWhere(
    userId: string,
    agencyId?: string,
  ): FindOptionsWhere<Content> {
    return agencyId ? { user: { agencyId } } : { userId };
  }

  create(createContentDto: CreateContentDto, userId: string) {
    return this.contentRepository.save({ ...createContentDto, userId });
  }

  findAll(userId: string, agencyId?: string) {
    return this.contentRepository.find({
      where: this.scopeWhere(userId, agencyId),
      relations: ['user'],
      select: { user: AUTHOR_SELECT },
      order: { createdAt: 'DESC' },
    });
  }

  findAllWithSEO(userId: string) {
    return this.contentRepository.find({
      where: { userId },
      relations: ['seo'],
    });
  }

  findAllWithNotion(userId: string) {
    return this.contentRepository.find({
      where: { userId },
      relations: ['notion'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllWithSeoPaginated(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: ContentStatusEnum,
    agencyId?: string,
  ): Promise<PaginatedResult<Content>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.contentRepository.findAndCount({
      where: {
        ...this.scopeWhere(userId, agencyId),
        status: status ?? Not(ContentStatusEnum.ARCHIVED),
      },
      relations: ['seo', 'user'],
      select: { user: AUTHOR_SELECT },
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

  async findOne(id: string, userId: string, agencyId?: string) {
    const where = agencyId
      ? [{ id, userId }, { id, user: { agencyId } }]
      : { id, userId };

    const content = await this.contentRepository.findOne({
      where,
      relations: ['seo', 'notion', 'user'],
      select: { user: AUTHOR_SELECT },
    });

    if (!content) {
      throw new NotFoundException(`Content with id ${id} not found`);
    }

    return content;
  }

  async getStats(userId: string) {
    const [
      total,
      published,
      draft,
      waitingPublish,
      archived,
      byPlatformRaw,
      avgSeoRaw,
    ] = await Promise.all([
      this.contentRepository.count({ where: { userId } }),
      this.contentRepository.count({
        where: { userId, status: ContentStatusEnum.PUBLISHED },
      }),
      this.contentRepository.count({
        where: { userId, status: ContentStatusEnum.DRAFT },
      }),
      this.contentRepository.count({
        where: { userId, status: ContentStatusEnum.WAITING_PUBLISH },
      }),
      this.contentRepository.count({
        where: { userId, status: ContentStatusEnum.ARCHIVED },
      }),
      this.contentRepository
        .createQueryBuilder('c')
        .select('c.contentPlatform', 'platform')
        .addSelect('COUNT(*)', 'count')
        .where('c.userId = :userId', { userId })
        .groupBy('c.contentPlatform')
        .getRawMany<{ platform: string; count: string }>(),
      this.contentRepository
        .createQueryBuilder('c')
        .leftJoin('c.seo', 'seo')
        .select('AVG(seo.score)', 'avg')
        .where('c.userId = :userId', { userId })
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
      archived,
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

    return this.findOne(contentId, content.userId as string);
  }

  async update(id: string, updateContentDto: UpdateContentDto, userId: string) {
    await this.findOne(id, userId);
    return this.contentRepository.update({ id, userId }, updateContentDto);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.contentRepository.delete({ id, userId });
  }
}
