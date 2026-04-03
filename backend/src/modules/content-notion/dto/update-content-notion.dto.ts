import { PartialType } from '@nestjs/swagger';
import { CreateContentNotionDto } from './create-content-notion.dto';

export class UpdateContentNotionDto extends PartialType(CreateContentNotionDto) {}
