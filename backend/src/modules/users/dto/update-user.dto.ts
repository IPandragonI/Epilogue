import { PartialType } from '@nestjs/swagger';
import { RegisterDto } from '../../../auth/dto/auth.dto';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto extends PartialType(RegisterDto) {
  @IsOptional()
  @IsString()
  @IsUrl()
  avatarUrl?: string;
}
