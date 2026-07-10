import { IsOptional, IsString } from 'class-validator';

export class CreateContentSeoDto {
  score!: number;
  keywords!: string;
  review!: string;

  @IsOptional()
  @IsString()
  contentId?: string;
}
