import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateTextDto {
    @ApiProperty({
        description: 'Le texte à envoyer au modèle IA',
        example: 'Résume les tendances du marketing digital en 2025.',
    })
    @IsString()
    prompt: string;
}