import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSuggestedTopicDto } from './dto/create-suggested-topic.dto';
import { UpdateSuggestedTopicDto } from './dto/update-suggested-topic.dto';
import { SuggestedTopic } from './entities/suggested-topic.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AIService } from '../ai/ai.service';
import { Content } from '../content/entities/content.entity';
import { CurationItem } from '../curation-item/entities/curation-item.entity';

@Injectable()
export class SuggestedTopicService {

    constructor(
      @InjectRepository(SuggestedTopic)
      private suggestedTopicRepository: Repository<SuggestedTopic>,
      @InjectRepository(Content)
      private contentRepository: Repository<Content>,
      @InjectRepository(CurationItem)
      private curationItemRepository: Repository<CurationItem>,
      private aiService: AIService,
    ) {
    }


  create(createContentIdeaDto: CreateSuggestedTopicDto, userId: string) {
    return this.suggestedTopicRepository.save({
      ...createContentIdeaDto,
      userId,
    });
  }

  async generateForUser(
    userId: string,
    terms: string,
    curationItemIds?: string[],
  ) {
    const [curationItems, contentHistory, existingTopics] = await Promise.all([
      this.findCurationItemsForGeneration(userId, curationItemIds),
      this.contentRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 8,
      }),
      this.suggestedTopicRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 12,
      }),
    ]);

    const generatedTopics = await this.aiService.generateSuggestedTopics(terms, {
      curationItems: curationItems.map((item) => ({
        title: item.title,
        summary: truncateText(item.summary),
      })),
      contentHistory: contentHistory.map((content) => ({
        title: content.title,
        summary: truncateText(stripHtml(content.body)),
        platform: content.contentPlatform,
      })),
      existingTopics: existingTopics.map((topic) => ({
        title: topic.topic,
        summary: truncateText(topic.topicDescription),
        platform: topic.recommendedPlatform,
      })),
    });

    const existingTopicNames = new Set(
      existingTopics.map((topic) => topic.topic.trim().toLowerCase()),
    );

    const deduplicatedTopics = generatedTopics.filter(
      (topic) => !existingTopicNames.has(topic.topic.trim().toLowerCase()),
    );

    if (!deduplicatedTopics.length) {
      throw new InternalServerErrorException(
        'Aucune idée exploitable n’a été générée.',
      );
    }

    const topicsToSave = deduplicatedTopics.map((topic) =>
      this.suggestedTopicRepository.create({
        ...topic,
        userId,
      }),
    );

    return this.suggestedTopicRepository.save(topicsToSave);
  }

  findAllByUser(userId: string) {
    return this.suggestedTopicRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneByUser(id: string, userId: string) {
    const suggestedTopic = await this.suggestedTopicRepository.findOne({
      where: { id, userId },
    });

    if (!suggestedTopic) {
      throw new NotFoundException(`Suggested topic with id ${id} not found`);
    }

    return suggestedTopic;
  }

  async updateByUser(
    id: string,
    updateContentIdeaDto: UpdateSuggestedTopicDto,
    userId: string,
  ) {
    const suggestedTopic = await this.findOneByUser(id, userId);

    await this.suggestedTopicRepository.update(suggestedTopic.id, updateContentIdeaDto);

    return this.findOneByUser(id, userId);
  }

  async removeByUser(id: string, userId: string) {
    const suggestedTopic = await this.suggestedTopicRepository.findOne({
      where: { id, userId },
    });

    if (!suggestedTopic) {
      throw new NotFoundException(`Suggested topic with id ${id} not found`);
    }

    return this.suggestedTopicRepository.delete({ id, userId });
  }

  private async findCurationItemsForGeneration(
    userId: string,
    curationItemIds?: string[],
  ) {
    if (curationItemIds === undefined) {
      return this.curationItemRepository.find({
        where: { user: { id: userId } },
        order: { lastFetchedAt: 'DESC' },
        take: 3,
      });
    }

    if (!curationItemIds.length) {
      return [];
    }

    const curationItems = await this.curationItemRepository.find({
      where: {
        id: In(curationItemIds),
        user: { id: userId },
      },
    });

    const curationItemsById = new Map(
      curationItems.map((item) => [item.id, item]),
    );

    return curationItemIds
      .map((id) => curationItemsById.get(id))
      .filter((item): item is CurationItem => item !== undefined);
  }
}

function stripHtml(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateText(value: string | null | undefined, maxLength: number = 280): string {
  return String(value ?? '').trim().slice(0, maxLength);
}
