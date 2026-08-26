import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateVolunteerDto {
    @ApiProperty({
        description: 'Nome do voluntário',
        example: 'Voluntário de Teste',
        maxLength: 150,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name!: string;

    @ApiPropertyOptional({
        description: 'Email do voluntário',
        example: 'voluntario@teste.com',
        maxLength: 255,
    })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    email?: string;

    @ApiProperty({
        description: 'Telefone do voluntário',
        example: '(11) 99999-9999',
        maxLength: 20,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    phone!: string;
}
