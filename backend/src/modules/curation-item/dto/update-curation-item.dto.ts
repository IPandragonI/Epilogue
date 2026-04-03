import { PartialType } from '@nestjs/swagger';
import { CreateCurationItemDto } from './create-curation-item.dto';

export class UpdateCurationItemDto extends PartialType(CreateCurationItemDto) {}
