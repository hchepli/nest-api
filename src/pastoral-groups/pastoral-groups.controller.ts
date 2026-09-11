import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { PastoralGroupsService } from './pastoral-groups.service';
import { CreatePastoralGroupDto } from './dto/create-pastoral-group.dto';
import { UpdatePastoralGroupDto } from './dto/update-pastoral-group.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Auditable } from '../audit-logs/decorators/auditable.decorator';

@ApiBearerAuth()
@Controller('pastoral-groups')
export class PastoralGroupsController {
  constructor(private readonly pastoralGroupsService: PastoralGroupsService) {}

  @Auditable('PastoralGroup')
  @Roles('Admin Geral')
  @Post()
  create(@Body() createPastoralGroupDto: CreatePastoralGroupDto) {
    return this.pastoralGroupsService.create(createPastoralGroupDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.pastoralGroupsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.pastoralGroupsService.findOne(+id);
  }

  @Auditable('PastoralGroup')
  @Roles('Admin Geral', 'Coordenador de Pastoral')
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updatePastoralGroupDto: UpdatePastoralGroupDto,
    @Req() req: RequestWithUser,
  ) {
    return this.pastoralGroupsService.update(+id, updatePastoralGroupDto, req.user);
  }

  @Auditable('PastoralGroup')
  @Roles('Admin Geral')
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.pastoralGroupsService.remove(+id);
  }
}