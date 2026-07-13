import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { AgencyService } from './agency.service';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { RegisterDto } from '../../auth/dto/auth.dto';
import { JwtAuthGuard } from '../../auth/guards/auth.guards';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser, Roles } from '../../auth/decorators/auth.decorators';
import { UserRole } from '../users/entities/userRole.enum';

type AuthenticatedUser = {
  id: string;
  role: UserRole;
  agency: { id: string } | null;
};

@UseGuards(JwtAuthGuard)
@Controller('agency')
export class AgencyController {
  constructor(private readonly agencyService: AgencyService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  create(@Body() createAgencyDto: CreateAgencyDto) {
    return this.agencyService.create(createAgencyDto);
  }

  @Post(':id/user')
  createAgencyUser(
    @Param('id') id: string,
    @Body() user: RegisterDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    this.assertAgencyAdmin(id, currentUser);
    return this.agencyService.createAgencyUser(id, user);
  }

  @Get(':id/users')
  findAllUserAgency(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    this.assertAgencyMember(id, currentUser);
    return this.agencyService.findAllUserAgency(id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  findAll() {
    return this.agencyService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    this.assertAgencyMember(id, currentUser);
    return this.agencyService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAgencyDto: UpdateAgencyDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    this.assertAgencyAdmin(id, currentUser);
    return this.agencyService.update(id, updateAgencyDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agencyService.remove(id);
  }

  private assertAgencyMember(agencyId: string, user: AuthenticatedUser) {
    if (user.role === UserRole.SUPER_ADMIN) return;
    if (user.agency?.id !== agencyId) {
      throw new ForbiddenException("Vous n'avez pas accès à cette agence.");
    }
  }

  private assertAgencyAdmin(agencyId: string, user: AuthenticatedUser) {
    if (user.role === UserRole.SUPER_ADMIN) return;
    if (user.agency?.id !== agencyId || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        "Vous n'avez pas les droits d'administration sur cette agence.",
      );
    }
  }
}
