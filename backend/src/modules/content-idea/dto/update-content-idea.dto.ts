import { PartialType } from '@nestjs/swagger';
import { CreateContentIdeaDto } from './create-content-idea.dto';

export class UpdateContentIdeaDto extends PartialType(CreateContentIdeaDto) {}
