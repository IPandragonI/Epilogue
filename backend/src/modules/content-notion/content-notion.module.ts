import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentNotionService } from './content-notion.service';
import { ContentNotionController } from './content-notion.controller';
import { ContentNotion } from './entities/content-notion.entity';
import { Content } from '../content/entities/content.entity';
import { User } from '../users/entities/user.entity';
import { NotionApiService } from './notion-api.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContentNotion, Content, User]),
    AuthModule,
  ],
  controllers: [ContentNotionController],
  providers: [ContentNotionService, NotionApiService],
})
export class ContentNotionModule {}
