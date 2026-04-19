import { ApiProperty, PartialType } from '@nestjs/swagger';
import { RegisterDto } from '../../../auth/dto/auth.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(RegisterDto) {}
