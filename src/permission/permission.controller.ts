import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Roles('Admin Geral')
  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Roles('Admin Geral')
  @Get()
  findAll() {
    return this.permissionService.findAll();
  }

  @Roles('Admin Geral')
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.permissionService.findOne(+id);
  }

  @Roles('Admin Geral')
  @Patch(':id')
  update(@Param('id') id: number, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionService.update(+id, updatePermissionDto);
  }

  @Roles('Admin Geral')
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.permissionService.remove(+id);
  }
}