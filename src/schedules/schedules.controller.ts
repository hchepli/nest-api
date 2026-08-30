import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Req, Query } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleQueryDto } from './dto/schedule-query.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Res } from '@nestjs/common';
import type { Response } from 'express';
import { buildSchedulesCsv } from './utils/schedules-csv.util';

@ApiBearerAuth()
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto, @Req() req: RequestWithUser) {
    return this.schedulesService.create(createScheduleDto, req.user);
  }

  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Get()
  findAll(@Req() req: RequestWithUser, @Query() query: ScheduleQueryDto) {
    return this.schedulesService.findAll(req.user, query);
  }

  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUser) {
    return this.schedulesService.findOne(id, req.user);
  }

  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Req() req: RequestWithUser,
  ) {
    return this.schedulesService.update(id, updateScheduleDto, req.user);
  }

  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUser) {
    return this.schedulesService.remove(id, req.user);
  }

  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
@Get('report/export')
async exportReport(
  @Req() req: RequestWithUser,
  @Query() query: ScheduleQueryDto,
  @Query('format') format: string,
  @Res() res: Response,
) {
  if (format !== 'csv') {
    return res.status(400).json({
      message: 'Formato inválido. Apenas "csv" é aceito por enquanto.',
    });
  }

  const schedules = await this.schedulesService.findAllForExport(req.user, query);
  const csv = buildSchedulesCsv(schedules);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="relatorio-escalas.csv"',
  );
  res.send(csv);
}
}