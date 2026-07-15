import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from 'src/modules/users/entities/userRole.enum';

export class RegisterDto {
  @ApiProperty({ example: 'Jean' })
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({ example: 'jean.dupont@entreprise.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'motdepasse123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Mon Agence' })
  @IsString()
  @IsNotEmpty()
  agencyName: string;

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class LoginDto {
  @ApiProperty({ example: 'jean.dupont@entreprise.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'jean.dupont@entreprise.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset-token-recu-par-email' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'nouveaumotdepasse123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
