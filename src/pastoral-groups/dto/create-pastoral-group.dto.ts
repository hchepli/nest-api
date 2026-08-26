import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

// Equivalente ao "model PastoralGroup" do schema.prisma (tabela `pastorais` no SQL de referência).
export class CreatePastoralGroupDto {
  @ApiProperty({
    description: 'Nome da pastoral',
    example: 'Pastoral da Catequese',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    description: 'Descrição da pastoral e suas atividades',
    example: 'Responsável pela preparação de crianças e adolescentes para a Primeira Eucaristia.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Contato da pastoral (telefone, e-mail ou responsável)',
    example: '(47) 99999-0000',
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  contact?: string;

  // Vínculo com Coordenador (User.pastoralGroupId) NÃO aparece aqui:
  // a relação é definida do lado do User (RN006), não ao criar a Pastoral.
}