import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ContentNotionService } from './content-notion.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guards';
import { CurrentUser } from '../../auth/decorators/auth.decorators';

@UseGuards(JwtAuthGuard)
@Controller('content-notion')
export class ContentNotionController {
  constructor(private readonly contentNotionService: ContentNotionService) {}

  @Post('sync/:contentId')
  sync(
    @Param('contentId') contentId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.contentNotionService.syncContent(contentId, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.contentNotionService.findAll(user.id);
  }
}
