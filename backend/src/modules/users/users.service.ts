import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { UserRole } from './entities/userRole.enum';
import { UpdateCloudSpaceDto } from '../cloud-space/dto/update-cloud-space.dto';
import * as bcrypt from 'bcrypt';
import { CloudSpace } from '../cloud-space/entities/cloud-space.entity';
import { CurationItem } from '../curation-item/entities/curation-item.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CloudSpace)
    private cloudSpaceRepository: Repository<CloudSpace>,
    @InjectRepository(CurationItem)
    private curationItemRepository: Repository<CurationItem>,
  ) {}

  create(user: Partial<User>): Promise<User> {
    return this.userRepository.save(user as User);
  }

  // Retourne les users en incluant la relation cloudSpace
  findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['cloudSpace'] });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['cloudSpace'],
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
      relations: ['cloudSpace'],
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

  async updateCloudSpace(
    userId: string,
    updateCloudSpace: UpdateCloudSpaceDto,
  ): Promise<UpdateResult> {
    // Find the user with current cloudSpace relation
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['cloudSpace'],
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // If cloudSpace exists, update it
    if (user.cloudSpace) {
      Object.assign(user.cloudSpace, updateCloudSpace);
      await this.cloudSpaceRepository.save(user.cloudSpace);
      return { affected: 1 } as any;
    }

    // Otherwise, create a new CloudSpace and associate it to the user
    const newCs = this.cloudSpaceRepository.create({
      notionToken: (updateCloudSpace as any).notionToken,
    });
    const saved = await this.cloudSpaceRepository.save(newCs);
    user.cloudSpace = saved;
    await this.userRepository.save(user);
    return { affected: 1 } as any;
  }

  async remove(id: string, user: { id: string; role: UserRole }) {
    const userToRemove = await this.userRepository.findOneBy({ id });
    if (!userToRemove) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    if (user.id !== id && user.role !== UserRole.ADMIN) {
      throw new NotFoundException(
        `You do not have permission to delete this user`,
      );
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
