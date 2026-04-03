import { IsString, IsOptional } from 'class-validator';

export class GenerateTextDto {
    @IsString()
    prompt: string;

    @IsOptional()
    options?: Record<string, any>;
}