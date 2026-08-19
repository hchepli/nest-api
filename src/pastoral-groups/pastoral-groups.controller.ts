import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PastoralGroupsService } from './pastoral-groups.service';
import { CreatePastoralGroupDto } from './dto/create-pastoral-group.dto';
import { UpdatePastoralGroupDto } from './dto/update-pastoral-group.dto';

@Controller('pastoral-groups')
export class PastoralGroupsController {
  constructor(private readonly pastoralGroupsService: PastoralGroupsService) {}

  @Post()
  create(@Body() createPastoralGroupDto: CreatePastoralGroupDto) {
    return this.pastoralGroupsService.create(createPastoralGroupDto);
  }

  @Get()
  findAll() {
    return this.pastoralGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pastoralGroupsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePastoralGroupDto: UpdatePastoralGroupDto) {
    return this.pastoralGroupsService.update(+id, updatePastoralGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pastoralGroupsService.remove(+id);
  }
}
