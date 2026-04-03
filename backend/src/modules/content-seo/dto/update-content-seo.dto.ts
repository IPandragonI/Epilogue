import { PartialType } from '@nestjs/swagger';
import { CreateContentSeoDto } from './create-content-seo.dto';

export class UpdateContentSeoDto extends PartialType(CreateContentSeoDto) {}
