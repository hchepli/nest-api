import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MassesService } from './masses.service';
import { CreateMassDto } from './dto/create-mass.dto';
import { UpdateMassDto } from './dto/update-mass.dto';
import { LinkPastoralGroupsDto } from './dto/link-pastoral-groups.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('masses')
export class MassesController {
  constructor(private readonly massesService: MassesService) {}

  @Roles('Admin Geral', 'Secretaria')
  @Post()
  create(@Body() createMassDto: CreateMassDto) {
    return this.massesService.create(createMassDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.massesService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.massesService.findOne(+id);
  }

  @Roles('Admin Geral', 'Secretaria')
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateMassDto: UpdateMassDto) {
    return this.massesService.update(+id, updateMassDto);
  }

  @Roles('Admin Geral', 'Secretaria')
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.massesService.remove(+id);
  }

  // RN017 (proposta): vincula Pastorais participantes desta Missa
  @Roles('Admin Geral', 'Secretaria')
  @Post(':id/pastoral-groups')
  linkPastoralGroups(@Param('id') id: number, @Body() dto: LinkPastoralGroupsDto) {
    return this.massesService.linkPastoralGroups(+id, dto);
  }
}