import { Module } from '@nestjs/common';
import { ContentNotionService } from './content-notion.service';
import { ContentNotionController } from './content-notion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentNotion } from './entities/content-notion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContentNotion])],
  controllers: [ContentNotionController],
  providers: [ContentNotionService],
})
export class ContentNotionModule {}
