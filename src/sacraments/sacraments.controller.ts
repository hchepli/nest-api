import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SacramentsService } from './sacraments.service';
import { CreateSacramentDto } from './dto/create-sacrament.dto';
import { UpdateSacramentDto } from './dto/update-sacrament.dto';

@Controller('sacraments')
export class SacramentsController {
  constructor(private readonly sacramentsService: SacramentsService) {}

  @Post()
  create(@Body() createSacramentDto: CreateSacramentDto) {
    return this.sacramentsService.create(createSacramentDto);
  }

  @Get()
  findAll() {
    return this.sacramentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sacramentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSacramentDto: UpdateSacramentDto) {
    return this.sacramentsService.update(+id, updateSacramentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sacramentsService.remove(+id);
  }
}
