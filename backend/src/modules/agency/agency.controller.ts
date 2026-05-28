import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AgencyService } from './agency.service';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { RegisterDto } from '../../auth/dto/auth.dto';

@Controller('agency')
export class AgencyController {
  constructor(private readonly agencyService: AgencyService) {}

  @Post()
  create(@Body() createAgencyDto: CreateAgencyDto) {
    return this.agencyService.create(createAgencyDto);
  }

  @Post(':id/user')
  createAgencyUser(@Param('id') id: string, @Body() user: RegisterDto) {
    return this.agencyService.createAgencyUser(id, user);
  }

  @Get(':id/users')
  findAllUserAgency(@Param('id') id: string) {
    return this.agencyService.findAllUserAgency(id);
  }

  @Get()
  findAll() {
    return this.agencyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agencyService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgencyDto: UpdateAgencyDto) {
    return this.agencyService.update(id, updateAgencyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agencyService.remove(id);
  }
}
