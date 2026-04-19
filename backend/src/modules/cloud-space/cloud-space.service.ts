import { Injectable } from '@nestjs/common';
import { CreateCloudSpaceDto } from './dto/create-cloud-space.dto';
import { UpdateCloudSpaceDto } from './dto/update-cloud-space.dto';

@Injectable()
export class CloudSpaceService {
  create(createCloudSpaceDto: CreateCloudSpaceDto) {
    return 'This action adds a new cloudSpace';
  }

  findAll() {
    return `This action returns all cloudSpace`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cloudSpace`;
  }

  update(id: number, updateCloudSpaceDto: UpdateCloudSpaceDto) {
    return `This action updates a #${id} cloudSpace`;
  }

  remove(id: number) {
    return `This action removes a #${id} cloudSpace`;
  }
}
