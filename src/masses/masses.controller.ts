import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MassesService } from './masses.service';
import { CreateMassDto } from './dto/create-mass.dto';
import { UpdateMassDto } from './dto/update-mass.dto';

@Controller('masses')
export class MassesController {
  constructor(private readonly massesService: MassesService) {}

  @Post()
  create(@Body() createMassDto: CreateMassDto) {
    return this.massesService.create(createMassDto);
  }

  @Get()
  findAll() {
    return this.massesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.massesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMassDto: UpdateMassDto) {
    return this.massesService.update(+id, updateMassDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.massesService.remove(+id);
  }
}
