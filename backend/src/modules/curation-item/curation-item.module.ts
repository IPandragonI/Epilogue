import { Module } from '@nestjs/common';
import { CurationItemService } from './curation-item.service';
import { CurationItemController } from './curation-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurationItem } from './entities/curation-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CurationItem])],
  controllers: [CurationItemController],
  providers: [CurationItemService],
})
export class CurationItemModule {}
