import { Injectable } from '@nestjs/common';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { Repository } from 'typeorm';
import { Agency } from './entities/agency.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AgencyService {

    constructor(
      @InjectRepository(Agency)
      private agencyRepository: Repository<Agency>) {
    }

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
}
