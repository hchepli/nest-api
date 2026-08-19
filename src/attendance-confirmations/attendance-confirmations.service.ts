import { Injectable } from '@nestjs/common';
import { CreateAttendanceConfirmationDto } from './dto/create-attendance-confirmation.dto';
import { UpdateAttendanceConfirmationDto } from './dto/update-attendance-confirmation.dto';

@Injectable()
export class AttendanceConfirmationsService {
  create(createAttendanceConfirmationDto: CreateAttendanceConfirmationDto) {
    return 'This action adds a new attendanceConfirmation';
  }

  findAll() {
    return `This action returns all attendanceConfirmations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} attendanceConfirmation`;
  }

  update(id: number, updateAttendanceConfirmationDto: UpdateAttendanceConfirmationDto) {
    return `This action updates a #${id} attendanceConfirmation`;
  }

  remove(id: number) {
    return `This action removes a #${id} attendanceConfirmation`;
  }
}
