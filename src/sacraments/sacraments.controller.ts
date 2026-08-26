import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SacramentsService } from './sacraments.service';
import { CreateSacramentDto } from './dto/create-sacrament.dto';
import { UpdateSacramentDto } from './dto/update-sacrament.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('sacraments')
export class SacramentsController {
  constructor(private readonly sacramentsService: SacramentsService) {}

  @Roles('Admin Geral', 'Secretaria')
  @Post()
  create(@Body() createSacramentDto: CreateSacramentDto) {
    return this.sacramentsService.create(createSacramentDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.sacramentsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.sacramentsService.findOne(+id);
  }

  @Roles('Admin Geral', 'Secretaria')
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateSacramentDto: UpdateSacramentDto) {
    return this.sacramentsService.update(+id, updateSacramentDto);
  }

  @Roles('Admin Geral', 'Secretaria')
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.sacramentsService.remove(+id);
  }
}