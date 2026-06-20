import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { UserRole } from './entities/userRole.enum';
import * as bcrypt from 'bcrypt';
import { CurationItem } from '../curation-item/entities/curation-item.entity';
import { SubscriptionFeatureEnum } from '../../auth/decorators/subscription.decorator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CurationItem)
    private curationItemRepository: Repository<CurationItem>,
  ) {}

  create(user: Partial<User>): Promise<User> {
    return this.userRepository.save(user as User);
  }

  // Retourne les users en incluant la relation agency
  findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['agency'] });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['agency'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  // renvoie null si non trouvé — utile côté auth/login
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['agency'],
    });
    return user ?? null;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    return await this.userRepository.update(id, updateUserDto);
  }

  async remove(id: string) {
    const userToRemove = await this.userRepository.findOneBy({ id });
    if (!userToRemove) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.userRepository.remove(userToRemove);
    return { deleted: true };
  }

  getCurationItemsByUserId(id: string) {
    return this.curationItemRepository.find({
      where: {
        user: {
          id: id,
        },
      },
      relations: {
        source: true,
      },
    });
  }

  async getAgencyMonthlyUsage(
    agencyId: string,
  ): Promise<{ tokens: number; curations: number; ideaGenerations: number }> {
    const currentMonth = this.getCurrentMonth();

    const result = await this.userRepository
      .createQueryBuilder('user')
      .select('COALESCE(SUM(user.nbTokenUsedThisMonth), 0)', 'tokens')
      .addSelect('COALESCE(SUM(user.nbCurationUsedThisMonth), 0)', 'curations')
      .addSelect(
        'COALESCE(SUM(user.nbIdeaGenerationUsedThisMonth), 0)',
        'ideaGenerations',
      )
      .where('user.agencyId = :agencyId', { agencyId })
      .andWhere('user.usageMonth = :month', { month: currentMonth })
      .getRawOne();

    return {
      tokens: parseInt(result.tokens, 10) || 0,
      curations: parseInt(result.curations, 10) || 0,
      ideaGenerations: parseInt(result.ideaGenerations, 10) || 0,
    };
  }

  async incrementUsage(
    userId: string,
    feature: SubscriptionFeatureEnum,
  ): Promise<void> {
    const currentMonth = this.getCurrentMonth();
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) return;

    if (user.usageMonth !== currentMonth) {
      await this.userRepository.update(userId, {
        nbTokenUsedThisMonth: 0,
        nbCurationUsedThisMonth: 0,
        nbIdeaGenerationUsedThisMonth: 0,
        usageMonth: currentMonth,
      });
    }

    const fieldMap: Record<SubscriptionFeatureEnum, keyof User> = {
      [SubscriptionFeatureEnum.TOKEN]: 'nbTokenUsedThisMonth',
      [SubscriptionFeatureEnum.CURATION]: 'nbCurationUsedThisMonth',
      [SubscriptionFeatureEnum.IDEA_GENERATION]: 'nbIdeaGenerationUsedThisMonth',
    };

    await this.userRepository.increment({ id: userId }, fieldMap[feature] as string, 1);
  }

  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
