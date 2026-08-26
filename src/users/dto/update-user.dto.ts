import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { UserStatus } from '../../../generated/prisma/client';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ enum: UserStatus, description: 'Status do usuário (ATIVO/INATIVO)' })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}