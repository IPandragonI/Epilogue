import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ContentNotionService } from './content-notion.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guards';
import { CurrentUser } from '../../auth/decorators/auth.decorators';

@Controller('content-notion')
export class ContentNotionController {
  constructor(private readonly contentNotionService: ContentNotionService) {}

  @Post('sync/:contentId')
  @UseGuards(JwtAuthGuard)
  sync(
    @Param('contentId') contentId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.contentNotionService.syncContent(contentId, user.id);
  }

  @Get()
  findAll() {
    return this.contentNotionService.findAll();
  }
}
