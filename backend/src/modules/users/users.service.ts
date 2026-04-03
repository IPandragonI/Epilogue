import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserRole } from './entities/userRole.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  create(user: Partial<User>): Promise<User> {
    return this.userRepository.save(user as User);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    const user = this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    user: { id: string; role: UserRole },
  ): Promise<User> {
    const userToUpdate = await this.userRepository.findOneBy({ id });
    if (!userToUpdate) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    if (user.id !== id) {
      throw new NotFoundException(
        `You do not have permission to update this user`,
      );
    }
    Object.assign(userToUpdate, updateUserDto);
    return await this.userRepository.save(userToUpdate);
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
}
