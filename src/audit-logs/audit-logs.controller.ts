import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import { ParseIntPipe } from '@nestjs/common/pipes/parse-int.pipe';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Roles('Admin Geral')
  @Post()
  create(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.auditLogsService.create(createAuditLogDto);
  }

  @Roles('Admin Geral')
  @Get()
  findAll() {
    return this.auditLogsService.findAll();
  }

  @Roles('Admin Geral')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.auditLogsService.findOne(id);
  }

  @Roles('Admin Geral')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: string, @Body() updateAuditLogDto: UpdateAuditLogDto) {
    return this.auditLogsService.update(id, updateAuditLogDto);
  }

  @Roles('Admin Geral')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.auditLogsService.remove(id);
  }
}