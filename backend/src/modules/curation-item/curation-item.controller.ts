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
import { FastifyRequest } from 'fastify';

@Controller('curation-item')
export class CurationItemController {
  constructor(private readonly curationItemService: CurationItemService) {}

  @Post()
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @UseInterceptors(UsageTrackingInterceptor)
  @SubscriptionFeature(SubscriptionFeatureEnum.CURATION)
  create(@Body() createCurationItemDto: CreateCurationItemDto) {
    return this.curationItemService.create(createCurationItemDto);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req: FastifyRequest & { user: { id: string } }) {
    return this.curationItemService.findAllByUser(req.user.id);
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
  update(
    @Param('id') id: string,
    @Body() updateCurationItemDto: UpdateCurationItemDto,
  ) {
    return this.curationItemService.update(id, updateCurationItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.curationItemService.remove(id);
  }
}
