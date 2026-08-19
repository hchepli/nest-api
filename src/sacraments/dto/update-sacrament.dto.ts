import { PartialType } from '@nestjs/mapped-types';
import { CreateSacramentDto } from './create-sacrament.dto';

export class UpdateSacramentDto extends PartialType(CreateSacramentDto) {}
