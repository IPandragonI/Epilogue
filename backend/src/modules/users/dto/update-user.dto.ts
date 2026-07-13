import { PartialType } from '@nestjs/swagger';
import { RegisterDto } from '../../../auth/dto/auth.dto';
import { IsEnum, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';
import { UserRole } from '../entities/userRole.enum';

export class UpdateUserDto extends PartialType(RegisterDto) {
  @IsOptional()
  @IsString()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsUUID()
  agencyId?: string | null;
}
