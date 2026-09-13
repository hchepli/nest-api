import { IsDateString, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PendingScheduleQueryDto {
  @IsDateString({}, { message: 'start deve ser uma data válida (ISO 8601).' })
  start!: string;

  @IsDateString({}, { message: 'end deve ser uma data válida (ISO 8601).' })
  end!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pastoralGroupId?: number;
}