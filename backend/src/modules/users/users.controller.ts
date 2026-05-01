import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from './entities/userRole.enum';
import { JwtAuthGuard } from 'src/auth/guards/auth.guards';
import { Roles } from 'src/auth/decorators/auth.decorators';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateCloudSpaceDto } from '../cloud-space/dto/update-cloud-space.dto';
import { CurationItemService } from '../curation-item/curation-item.service';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve the list of all users.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users list retrieved successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findAll() {
    return await this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Get one user by id',
    description: 'Retrieve the user with his id.',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findOneById(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update one user',
    description: 'Retrieve the user with his id.',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/notion')
  @ApiOperation({
    summary: 'Update one user',
    description: 'Retrieve the user with his id.',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async updateCloudSpace(
    @Param('id') id: string,
    @Body() updateCloudSpace: UpdateCloudSpaceDto,
  ) {
    return await this.usersService.updateCloudSpace(id, updateCloudSpace);
  }

  @Get(':id/curation-items')
  @ApiOperation({
    summary: 'Get Curations items for a user',
    description: 'Retrieve the curation items with the user and his id.',
  })
  async getCurationItemsByUser(@Param('id') id: string) {
    return await this.usersService.getCurationItemsByUserId(id);
  }
}
