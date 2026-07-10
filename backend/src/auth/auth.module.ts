import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { StringValue } from 'ms';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

import {
  JwtAuthGuard,
  LocalAuthGuard,
} from './guards/auth.guards';
import { RolesGuard } from './guards/roles.guard';

import { UsersModule } from '../modules/users/users.module';
import { AccountsModule } from '../modules/accounts/accounts.module';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { MailModule } from '../modules/mail/mail.module';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([PasswordResetToken]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES') ?? '7d') as StringValue,
        },
      }),
    }),
    forwardRef(() => UsersModule),
    AccountsModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // Strategies
    JwtStrategy,
    LocalStrategy,
    // Guards
    JwtAuthGuard,
    LocalAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, JwtAuthGuard, LocalAuthGuard, RolesGuard],
})
export class AuthModule {}
