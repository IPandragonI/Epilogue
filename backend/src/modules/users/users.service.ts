import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { UserRole } from './entities/userRole.enum';
import * as bcrypt from 'bcrypt';
import { CurationItem } from '../curation-item/entities/curation-item.entity';

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
}
