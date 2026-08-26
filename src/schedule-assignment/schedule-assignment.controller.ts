import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ScheduleAssignmentService } from './schedule-assignment.service';
import { CreateScheduleAssignmentDto } from './dto/create-schedule-assignment.dto';
import { UpdateScheduleAssignmentDto } from './dto/update-schedule-assignment.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('schedule-assignment')
export class ScheduleAssignmentController {
  constructor(private readonly scheduleAssignmentService: ScheduleAssignmentService) {}

  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Post()
  create(@Body() createScheduleAssignmentDto: CreateScheduleAssignmentDto) {
    return this.scheduleAssignmentService.create(createScheduleAssignmentDto);
  }

  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Get()
  findAll() {
    return this.scheduleAssignmentService.findAll();
  }

  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleAssignmentService.findOne(+id);
  }

  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScheduleAssignmentDto: UpdateScheduleAssignmentDto) {
    return this.scheduleAssignmentService.update(+id, updateScheduleAssignmentDto);
  }

  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleAssignmentService.remove(+id);
  }
}