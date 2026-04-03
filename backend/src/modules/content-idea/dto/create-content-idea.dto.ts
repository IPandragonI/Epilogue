import { Topic } from "src/modules/topic/entities/topic.entity";
import { PlatformEnum } from '../entities/platform.enum';

export class CreateContentIdeaDto {
    title!: string;
    description!: string;
    topicId!: string;
    topic!: Topic;
    platform!: PlatformEnum;
}
