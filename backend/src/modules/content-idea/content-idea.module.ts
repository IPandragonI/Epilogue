import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentIdeaService } from './content-idea.service';
import { ContentIdeaController } from './content-idea.controller';
import { ContentIdea } from './entities/content-idea.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContentIdea])],
  controllers: [ContentIdeaController],
  providers: [ContentIdeaService],
})
export class ContentIdeaModule {}
