import { Topic } from "src/modules/topic/entities/topic.entity";

export class CreateContentIdeaDto {
    title!: string;
    description!: string;
    topicId!: string;
    topic!: Topic;
}
