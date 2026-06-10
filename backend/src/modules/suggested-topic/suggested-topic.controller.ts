import { SuggestedTopicService } from './suggested-topic.service';
import { CreateSuggestedTopicDto } from './dto/create-suggested-topic.dto';
import { UpdateSuggestedTopicDto } from './dto/update-suggested-topic.dto';
import { GenerateSuggestedTopicsDto } from './dto/generate-suggested-topics.dto';
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
import { JwtAuthGuard } from '../../auth/guards/auth.guards';
import { SubscriptionGuard } from '../../auth/guards/subscription.guard';
import { UsageTrackingInterceptor } from '../../auth/interceptors/usage-tracking.interceptor';
import { CurrentUser } from '../../auth/decorators/auth.decorators';
import {
  SubscriptionFeature,
  SubscriptionFeatureEnum,
} from '../../auth/decorators/subscription.decorator';

@Controller('suggested-topic')
export class SuggestedTopicController {
  constructor(private readonly suggestedTopicService: SuggestedTopicService) {}

  @Post()
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @UseInterceptors(UsageTrackingInterceptor)
  @SubscriptionFeature(SubscriptionFeatureEnum.IDEA_GENERATION)
  create(
    @Body() createContentIdeaDto: CreateSuggestedTopicDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.suggestedTopicService.create(createContentIdeaDto, user.id);
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @UseInterceptors(UsageTrackingInterceptor)
  @SubscriptionFeature(SubscriptionFeatureEnum.IDEA_GENERATION)
  generate(
    @Body() dto: GenerateSuggestedTopicsDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.suggestedTopicService.generateForUser(
      user.id,
      dto.terms,
      dto.curationItemIds,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: { id: string }) {
    return this.suggestedTopicService.findAllByUser(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.suggestedTopicService.findOneByUser(id, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateContentIdeaDto: UpdateSuggestedTopicDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.suggestedTopicService.updateByUser(
      id,
      updateContentIdeaDto,
      user.id,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.suggestedTopicService.removeByUser(id, user.id);
  }
}
