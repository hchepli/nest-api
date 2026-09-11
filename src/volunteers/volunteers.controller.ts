import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { VolunteersService } from './volunteers.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Auditable } from '../audit-logs/decorators/auditable.decorator';

@ApiBearerAuth()
@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Auditable('Volunteer')
  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Post()
  create(@Body() createVolunteerDto: CreateVolunteerDto, @Req() req: RequestWithUser) {
    return this.volunteersService.create(createVolunteerDto, req.user);
  }

  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Get()
  findAll(@Query('pastoralGroupId') pastoralGroupId?: string) {
    return this.volunteersService.findAll(
      pastoralGroupId ? +pastoralGroupId : undefined,
    );
  }

  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.volunteersService.findOne(+id);
  }

  @Auditable('Volunteer')
  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateVolunteerDto: UpdateVolunteerDto,
    @Req() req: RequestWithUser,
  ) {
    return this.volunteersService.update(+id, updateVolunteerDto, req.user);
  }

  @Auditable('Volunteer')
  @Roles('Admin Geral', 'Secretaria', 'Coordenador de Pastoral')
  @Delete(':id')
  remove(@Param('id') id: number, @Req() req: RequestWithUser) {
    return this.volunteersService.remove(+id, req.user);
  }
}