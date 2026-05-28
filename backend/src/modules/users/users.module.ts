import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from '../../auth/auth.module';
import { CurationItem } from '../curation-item/entities/curation-item.entity';
import { Agency } from '../agency/entities/agency.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Agency, CurationItem]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
