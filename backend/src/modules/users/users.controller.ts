import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from './entities/userRole.enum';
import { JwtAuthGuard } from 'src/auth/guards/auth.guards';
import { Roles } from 'src/auth/decorators/auth.decorators';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all users', description: 'Retrieve the list of all users.' })
  @ApiResponse({ status: 200, description: 'Users list retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findAll() {
    return await this.usersService.findAll();
  }
}
