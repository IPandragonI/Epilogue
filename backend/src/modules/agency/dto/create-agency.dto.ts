import { IsString, IsOptional } from 'class-validator';

export class CreateAgencyDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  notionToken?: string;
}
