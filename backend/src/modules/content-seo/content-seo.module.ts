import { Module } from '@nestjs/common';
import { ContentSeoService } from './content-seo.service';
import { ContentSeoController } from './content-seo.controller';
import { ContentSeo } from './entities/content-seo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ContentSeo])],
  controllers: [ContentSeoController],
  providers: [ContentSeoService],
})
export class ContentSeoModule {}
