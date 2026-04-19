import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCloudSpaceDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  notionToken: string;
}
