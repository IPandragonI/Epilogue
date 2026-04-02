import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';
import { UserRole } from '../../modules/users/entities/userRole.enum';

export class RegisterDto {

  @ApiProperty({ example: 'Jean', description: 'User first name' })
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @ApiProperty({ example: 'Dupont', description: 'User last name' })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({ example: 'jean.dupont@example.com', description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd!',
    description: 'User password (8-128 characters, at least one uppercase letter, one lowercase letter, one number and one special character)',
  })
  @IsString()
  @Length(8, 128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial',
  })
  password: string;

  @ApiProperty({ example: UserRole.PUBLIC, enum: UserRole, description: 'User role (optional, default: PUBLIC)' })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
