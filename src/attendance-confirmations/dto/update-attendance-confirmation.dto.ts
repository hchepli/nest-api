import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceConfirmationDto } from './create-attendance-confirmation.dto';

export class UpdateAttendanceConfirmationDto extends PartialType(CreateAttendanceConfirmationDto) {}
