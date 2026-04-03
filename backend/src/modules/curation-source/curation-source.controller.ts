import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CurationSourceService } from './curation-source.service';
import { CreateCurationSourceDto } from './dto/create-curation-source.dto';
import { UpdateCurationSourceDto } from './dto/update-curation-source.dto';

@Controller('curation-source')
export class CurationSourceController {
  constructor(private readonly curationSourceService: CurationSourceService) {}

  @Post()
  create(@Body() createCurationSourceDto: CreateCurationSourceDto) {
    return this.curationSourceService.create(createCurationSourceDto);
  }

  @Get()
  findAll() {
    return this.curationSourceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.curationSourceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCurationSourceDto: UpdateCurationSourceDto) {
    return this.curationSourceService.update(+id, updateCurationSourceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.curationSourceService.remove(+id);
  }
}
