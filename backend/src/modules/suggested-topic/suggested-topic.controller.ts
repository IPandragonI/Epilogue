import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SuggestedTopicService } from './suggested-topic.service';
import { CreateSuggestedTopicDto } from './dto/create-suggested-topic.dto';
import { UpdateSuggestedTopicDto } from './dto/update-suggested-topic.dto';
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

@Controller('suggested-topic')
export class SuggestedTopicController {
  constructor(private readonly contentIdeaService: SuggestedTopicService) {}

  @Post()
  create(@Body() createContentIdeaDto: CreateSuggestedTopicDto) {
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
  update(@Param('id') id: string, @Body() updateContentIdeaDto: UpdateSuggestedTopicDto) {
    return this.contentIdeaService.update(id, updateContentIdeaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentIdeaService.remove(id);
  }
}
