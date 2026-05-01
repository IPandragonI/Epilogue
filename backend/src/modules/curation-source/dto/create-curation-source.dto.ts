import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCurationSourceDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  sourceType!: string;

  @IsNotEmpty()
  @IsString()
  sourceUrl!: string;
}
