import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgencySubscriptionService } from './agency-subscription.service';
import { CreateAgencySubscriptionDto } from './dto/create-agency-subscription.dto';
import { ChangePlanDto } from './dto/change-plan.dto';
import { JwtAuthGuard } from '../../auth/guards/auth.guards';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/auth.decorators';
import { UserRole } from '../users/entities/userRole.enum';

@ApiTags('Agency Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('agency-subscriptions')
export class AgencySubscriptionController {
  constructor(private readonly service: AgencySubscriptionService) {}

  @Get('agency/:agencyId')
  @ApiOperation({ summary: "Récupère l'abonnement actif d'une agence" })
  findActive(@Param('agencyId') agencyId: string) {
    return this.service.findActiveByAgency(agencyId);
  }

  @Get('agency/:agencyId/history')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Historique des abonnements d'une agence (admin)" })
  findHistory(@Param('agencyId') agencyId: string) {
    return this.service.findAllByAgency(agencyId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Souscrit à un plan (admin)' })
  subscribe(@Body() dto: CreateAgencySubscriptionDto) {
    return this.service.subscribe(dto);
  }

  @Patch('agency/:agencyId/change-plan')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Change le plan d'une agence (admin)" })
  changePlan(@Param('agencyId') agencyId: string, @Body() dto: ChangePlanDto) {
    return this.service.changePlan(agencyId, dto.subscriptionPlanId);
  }

  @Delete('agency/:agencyId/cancel')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Résilie l'abonnement d'une agence (admin)" })
  cancel(@Param('agencyId') agencyId: string) {
    return this.service.cancel(agencyId);
  }
}
