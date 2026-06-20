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
} from '@nestjs/common';
import { ContentIdeaService } from './content-idea.service';
import { CreateContentIdeaDto } from './dto/create-content-idea.dto';
import { UpdateContentIdeaDto } from './dto/update-content-idea.dto';
import { JwtAuthGuard } from '../../auth/guards/auth.guards';
import { SubscriptionGuard } from '../../auth/guards/subscription.guard';
import { UsageTrackingInterceptor } from '../../auth/interceptors/usage-tracking.interceptor';
import {
  SubscriptionFeature,
  SubscriptionFeatureEnum,
} from '../../auth/decorators/subscription.decorator';

@Controller('content-idea')
export class ContentIdeaController {
  constructor(private readonly contentIdeaService: ContentIdeaService) {}

  @Post()
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @UseInterceptors(UsageTrackingInterceptor)
  @SubscriptionFeature(SubscriptionFeatureEnum.IDEA_GENERATION)
  create(@Body() createContentIdeaDto: CreateContentIdeaDto) {
    return this.contentIdeaService.create(createContentIdeaDto);
  }

  @Get()
  findAll() {
    return this.contentIdeaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentIdeaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContentIdeaDto: UpdateContentIdeaDto) {
    return this.contentIdeaService.update(id, updateContentIdeaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentIdeaService.remove(id);
  }
}
