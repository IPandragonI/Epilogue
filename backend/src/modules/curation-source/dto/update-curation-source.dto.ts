import { PartialType } from '@nestjs/swagger';
import { CreateCurationSourceDto } from './create-curation-source.dto';

export class UpdateCurationSourceDto extends PartialType(CreateCurationSourceDto) {}
