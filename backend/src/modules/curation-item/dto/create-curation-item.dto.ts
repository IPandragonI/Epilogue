import { CurationSource } from "src/modules/curation-source/entities/curation-source.entity";

export class CreateCurationItemDto {
    title!: string;
    summary!: string;
    author?: string;
    source!: CurationSource;
}
