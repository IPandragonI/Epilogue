import { Module } from '@nestjs/common';
import { CurationSourceService } from './curation-source.service';
import { CurationSourceController } from './curation-source.controller';
import { CurationSource } from './entities/curation-source.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CurationSource])],
  controllers: [CurationSourceController],
  providers: [CurationSourceService],
})
export class CurationSourceModule {}
