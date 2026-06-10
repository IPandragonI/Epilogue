import { PartialType } from '@nestjs/swagger';
import { CreateSuggestedTopicDto } from './create-suggested-topic.dto';

export class UpdateSuggestedTopicDto extends PartialType(CreateSuggestedTopicDto) {}
