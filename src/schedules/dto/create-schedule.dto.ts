import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class CreateScheduleDto {
    @ApiPropertyOptional({
        description: 'Vínculo com Evento. Regra RN007 (Mass XOR Event, nunca ambos nem nenhum) é validada no ScheduleService, não aqui.',
    })
    @IsInt()
    @IsOptional()
    eventId?: number;

    @ApiPropertyOptional({
        description: 'Vínculo com Missa. Regra RN007 (Mass XOR Event) é validada no ScheduleService, não aqui.',
    })
    @IsInt()
    @IsOptional()
    massId?: number;

    @ApiPropertyOptional({
        description: 'Escopo/filtro de relatório por pastoral (RN006/RN008).',
    })
    @IsInt()
    @IsOptional()
    pastoralGroupId?: number;
}