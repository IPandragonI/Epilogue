import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { CurationItemService } from './curation-item.service';
import { CreateCurationItemDto } from './dto/create-curation-item.dto';
import { UpdateCurationItemDto } from './dto/update-curation-item.dto';
import { JwtAuthGuard } from '../../auth/guards/auth.guards';
import { SubscriptionGuard } from '../../auth/guards/subscription.guard';
import { UsageTrackingInterceptor } from '../../auth/interceptors/usage-tracking.interceptor';
import {
  SubscriptionFeature,
  SubscriptionFeatureEnum,
} from '../../auth/decorators/subscription.decorator';
import { CurrentUser } from '../../auth/decorators/auth.decorators';
import { FastifyRequest } from 'fastify';

@UseGuards(JwtAuthGuard)
@Controller('curation-item')
export class CurationItemController {
  constructor(private readonly curationItemService: CurationItemService) {}

  @Post()
  @UseGuards(SubscriptionGuard)
  @UseInterceptors(UsageTrackingInterceptor)
  @SubscriptionFeature(SubscriptionFeatureEnum.CURATION)
  create(
    @Body() createCurationItemDto: CreateCurationItemDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.curationItemService.create(createCurationItemDto, user.id);
  }

  @Get('mine')
  findMine(@Req() req: FastifyRequest & { user: { id: string } }) {
    return this.curationItemService.findAllByUser(req.user.id);
  }

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.curationItemService.findAllByUser(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.curationItemService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCurationItemDto: UpdateCurationItemDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.curationItemService.update(
      id,
      updateCurationItemDto,
      user.id,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.curationItemService.remove(id, user.id);
  }
}
