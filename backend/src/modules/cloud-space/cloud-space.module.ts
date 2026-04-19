import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudSpaceService } from './cloud-space.service';
import { CloudSpaceController } from './cloud-space.controller';
import { CloudSpace } from './entities/cloud-space.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CloudSpace])],
  controllers: [CloudSpaceController],
  providers: [CloudSpaceService],
  exports: [CloudSpaceService],
})
export class CloudSpaceModule {}
