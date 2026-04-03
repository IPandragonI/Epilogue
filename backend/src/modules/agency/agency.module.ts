import { Module } from '@nestjs/common';
import { AgencyService } from './agency.service';
import { AgencyController } from './agency.controller';
import { Agency } from './entities/agency.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Agency])],
  controllers: [AgencyController],
  providers: [AgencyService],
})
export class AgencyModule {}
