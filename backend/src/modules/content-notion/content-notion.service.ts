import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentNotion } from './entities/content-notion.entity';
import { Content } from '../content/entities/content.entity';
import { User } from '../users/entities/user.entity';
import { ContentNotionStatusEnum } from './entities/contentNotionStatus.enum';
import { NotionApiService } from './notion-api.service';

@Injectable()
export class ContentNotionService {
  constructor(
    @InjectRepository(ContentNotion)
    private contentNotionRepository: Repository<ContentNotion>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly notionApiService: NotionApiService,
  ) {}

  async syncContent(contentId: string, userId: string): Promise<ContentNotion> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['agency'],
    });

    if (!user?.agency) {
      throw new BadRequestException('Aucune agence associée à ce compte.');
    }

    const { notionToken: token, notionParentPageId: parentPageId } = user.agency;

    if (!token) {
      throw new BadRequestException(
        'Clé API Notion non configurée. Rendez-vous dans Paramètres → Intégration Notion.',
      );
    }

    if (!parentPageId) {
      throw new BadRequestException(
        'Page parente Notion non configurée. Rendez-vous dans Paramètres → Intégration Notion.',
      );
    }

    const content = await this.contentRepository.findOne({
      where: { id: contentId },
      relations: ['notion'],
    });

    if (!content) {
      throw new NotFoundException('Contenu introuvable.');
    }

    if (!content.notion) {
      content.notion = this.contentNotionRepository.create({
        notionSyncStatus: ContentNotionStatusEnum.SYNCING,
        notionPageId: '',
      });
    } else {
      content.notion.notionSyncStatus = ContentNotionStatusEnum.SYNCING;
    }

    await this.contentRepository.save(content);

    console.log(
      `[Notion sync] contentId=${contentId} bodyLength=${content.body?.length ?? 0} bodyPreview=${content.body?.slice(0, 120)}`,
    );

    try {
      let notionPageId: string;

      if (content.notion.notionPageId) {
        await this.notionApiService.updatePage(
          token,
          content.notion.notionPageId,
          content.title,
          content.body,
        );
        notionPageId = content.notion.notionPageId;
      } else {
        notionPageId = await this.notionApiService.createPage(
          token,
          parentPageId,
          content.title,
          content.body,
        );
      }

      content.notion.notionSyncStatus = ContentNotionStatusEnum.SYNCED;
      content.notion.notionPageId = notionPageId;
      await this.contentNotionRepository.save(content.notion);

      return content.notion;
    } catch (error) {
      content.notion.notionSyncStatus = ContentNotionStatusEnum.ERROR;
      await this.contentNotionRepository.save(content.notion);

      throw new BadRequestException(
        `Erreur lors de la synchronisation avec Notion : ${(error as Error).message}`,
      );
    }
  }

  findAll() {
    return this.contentNotionRepository.find();
  }
}
