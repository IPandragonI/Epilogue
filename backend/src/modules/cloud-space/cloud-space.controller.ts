import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CloudSpaceService } from './cloud-space.service';
import { CreateCloudSpaceDto } from './dto/create-cloud-space.dto';
import { UpdateCloudSpaceDto } from './dto/update-cloud-space.dto';

@Controller('cloud-space')
export class CloudSpaceController {
  constructor(private readonly cloudSpaceService: CloudSpaceService) {}

  @Post()
  create(@Body() createCloudSpaceDto: CreateCloudSpaceDto) {
    return this.cloudSpaceService.create(createCloudSpaceDto);
  }

  @Get()
  findAll() {
    return this.cloudSpaceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cloudSpaceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCloudSpaceDto: UpdateCloudSpaceDto) {
    return this.cloudSpaceService.update(+id, updateCloudSpaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cloudSpaceService.remove(+id);
  }
}
