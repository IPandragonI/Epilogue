import { Module } from '@nestjs/common';
import { CurationItemService } from './curation-item.service';
import { CurationItemController } from './curation-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurationItem } from './entities/curation-item.entity';
import { CurationSourceService } from '../curation-source/curation-source.service';
import { CurationSource } from '../curation-source/entities/curation-source.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CurationItem, CurationSource])],
  controllers: [CurationItemController],
  providers: [CurationItemService, CurationSourceService],
})
export class CurationItemModule {}
