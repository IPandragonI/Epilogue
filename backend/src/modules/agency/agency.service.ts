import { Injectable } from '@nestjs/common';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { Repository } from 'typeorm';
import { Agency } from './entities/agency.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from '../../auth/dto/auth.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AgencyService {
  constructor(
    @InjectRepository(Agency)
    private agencyRepository: Repository<Agency>,
    @InjectRepository(User)
    private userRepository: Repository<any>,
  ) {}

  create(createAgencyDto: CreateAgencyDto) {
    return this.agencyRepository.save(createAgencyDto as Agency);
  }

  findAll() {
    return this.agencyRepository.find();
  }

  findOne(id: string) {
    return this.agencyRepository.findOneBy({ id });
  }

  update(id: string, updateAgencyDto: UpdateAgencyDto) {
    return this.agencyRepository.update(id, updateAgencyDto);
  }

  remove(id: string) {
    return this.agencyRepository.delete(id);
  }

  async createAgencyUser(id: string, user: RegisterDto) {
    const agency = await this.agencyRepository.findOneBy({ id });
    if (!agency) {
      throw new Error('Agency not found');
    }
    user.password = await bcrypt.hash(user.password, 10);
    const newUser = {
      ...user,
      agency: agency,
    };
    return await this.userRepository.save(newUser);
  }

  async findAllUserAgency(id: string) {
    return await this.userRepository.find({
      where: { agency: { id: id } },
      relations: ['agency'],
    });
  }
}
