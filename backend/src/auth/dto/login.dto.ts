import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'jean.dupont@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'P@ssw0rd!', description: 'User password' })
  @IsString()
  password: string;
}
