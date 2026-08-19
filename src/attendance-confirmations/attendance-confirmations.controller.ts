import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AttendanceConfirmationsService } from './attendance-confirmations.service';
import { CreateAttendanceConfirmationDto } from './dto/create-attendance-confirmation.dto';
import { UpdateAttendanceConfirmationDto } from './dto/update-attendance-confirmation.dto';

@Controller('attendance-confirmations')
export class AttendanceConfirmationsController {
  constructor(private readonly attendanceConfirmationsService: AttendanceConfirmationsService) {}

  @Post()
  create(@Body() createAttendanceConfirmationDto: CreateAttendanceConfirmationDto) {
    return this.attendanceConfirmationsService.create(createAttendanceConfirmationDto);
  }

  @Get()
  findAll() {
    return this.attendanceConfirmationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceConfirmationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAttendanceConfirmationDto: UpdateAttendanceConfirmationDto) {
    return this.attendanceConfirmationsService.update(+id, updateAttendanceConfirmationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceConfirmationsService.remove(+id);
  }
}
