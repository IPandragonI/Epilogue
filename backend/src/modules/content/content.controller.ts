import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentStatusEnum } from './entities/contentStatus.enum';
import { JwtAuthGuard } from '../../auth/guards/auth.guards';
import { CurrentUser } from '../../auth/decorators/auth.decorators';

type AuthenticatedUser = {
  id: string;
  agency: { id: string } | null;
};

function resolveAgencyId(
  user: AuthenticatedUser,
  scope?: string,
): string | undefined {
  return scope === 'agency' ? (user.agency?.id ?? undefined) : undefined;
}

@UseGuards(JwtAuthGuard)
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  create(
    @Body() createContentDto: CreateContentDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.contentService.create(createContentDto, user.id);
  }

  @Get('with-seo')
  findAllWithSEO(@CurrentUser() user: { id: string }) {
    return this.contentService.findAllWithSEO(user.id);
  }

  @Get('with-notion')
  findAllWithNotion(@CurrentUser() user: { id: string }) {
    return this.contentService.findAllWithNotion(user.id);
  }

  @Get('with-seo-paginated')
  findAllWithSeoPaginated(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: ContentStatusEnum,
    @Query('scope') scope?: string,
  ) {
    return this.contentService.findAllWithSeoPaginated(
      user.id,
      +page,
      +limit,
      status,
      resolveAgencyId(user, scope),
    );
  }

  @Get('stats')
  getStats(@CurrentUser() user: { id: string }) {
    return this.contentService.getStats(user.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('scope') scope?: string,
  ) {
    return this.contentService.findAll(user.id, resolveAgencyId(user, scope));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.contentService.findOne(id, user.id, user.agency?.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContentDto: UpdateContentDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.contentService.update(id, updateContentDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.contentService.remove(id, user.id);
  }
}
