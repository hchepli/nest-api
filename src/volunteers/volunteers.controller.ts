import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VolunteersService } from './volunteers.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Post()
  create(@Body() createVolunteerDto: CreateVolunteerDto) {
    return this.volunteersService.create(createVolunteerDto);
  }

  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Get()
  findAll() {
    return this.volunteersService.findAll();
  }

  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.volunteersService.findOne(+id);
  }

  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateVolunteerDto: UpdateVolunteerDto) {
    return this.volunteersService.update(+id, updateVolunteerDto);
  }

  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.volunteersService.remove(+id);
  }
}