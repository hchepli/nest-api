import { PartialType } from '@nestjs/mapped-types';
import { CreatePastoralGroupDto } from './create-pastoral-group.dto';

export class UpdatePastoralGroupDto extends PartialType(CreatePastoralGroupDto) {}
