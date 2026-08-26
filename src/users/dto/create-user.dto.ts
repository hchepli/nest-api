import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, MaxLength, MinLength, IsInt, IsOptional } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        description: 'Nome do usuário',
        example: 'Usuário de Teste',
        maxLength: 150,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name!: string;

    @ApiProperty({
        description: 'Email do usuário',
        example: 'usuario@teste.com',
        maxLength: 255,
    })
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(255)
    email!: string;

    @ApiProperty({
        description: 'Senha do usuário (mínimo 8 caracteres). O hash é gerado no service, não aqui.',
        example: 'senhaForte123',
        minLength: 8,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password!: string;

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    roleId!: number;

    @ApiPropertyOptional({
        description: 'Obrigatório apenas se o cargo for "Coordenador de Pastoral" (RN006). Validação condicional fica no service.',
    })
    @IsInt()
    @IsOptional()
    pastoralGroupId?: number;
}