import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CurationItemService } from './curation-item.service';
import { CreateCurationItemDto } from './dto/create-curation-item.dto';
import { UpdateCurationItemDto } from './dto/update-curation-item.dto';

@Controller('curation-item')
export class CurationItemController {
  constructor(private readonly curationItemService: CurationItemService) {}

  @Post()
  create(@Body() createCurationItemDto: CreateCurationItemDto) {
    return this.curationItemService.create(createCurationItemDto);
  }

  @Get()
  findAll() {
    return this.curationItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.curationItemService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCurationItemDto: UpdateCurationItemDto) {
    return this.curationItemService.update(id, updateCurationItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.curationItemService.remove(id);
  }
}
