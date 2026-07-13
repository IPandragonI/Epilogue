import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from './entities/userRole.enum';
import { JwtAuthGuard } from 'src/auth/guards/auth.guards';
import { CurrentUser, Roles } from 'src/auth/decorators/auth.decorators';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
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
  async findOneById(
    @Param('id') id: string,
    @CurrentUser() currentUser: { id: string; role: UserRole },
  ) {
    this.assertSelfOrAdmin(id, currentUser);
    return await this.usersService.findOne(id);
  }

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
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: { id: string; role: UserRole },
  ) {
    this.assertSelfOrAdmin(id, currentUser);
    return await this.usersService.update(id, updateUserDto);
  }

  @Get(':id/curation-items')
  @ApiOperation({
    summary: 'Get Curations items for a user',
    description: 'Retrieve the curation items with the user and his id.',
  })
  async getCurationItemsByUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: { id: string; role: UserRole },
  ) {
    this.assertSelfOrAdmin(id, currentUser);
    return await this.usersService.getCurationItemsByUserId(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete one user',
    description: 'Delete the user with his id.',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: { id: string; role: UserRole },
  ) {
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.role !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Vous n’avez pas les droits pour supprimer cet utilisateur.',
      );
    }
    return await this.usersService.remove(id);
  }

  private assertSelfOrAdmin(
    targetId: string,
    currentUser: { id: string; role: UserRole },
  ) {
    const isAdmin =
      currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.SUPER_ADMIN;

    if (currentUser.id !== targetId && !isAdmin) {
      throw new ForbiddenException(
        "Vous n'avez pas accès à cette ressource.",
      );
    }
  }
}
