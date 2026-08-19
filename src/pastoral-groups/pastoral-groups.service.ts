import { Injectable } from '@nestjs/common';
import { CreatePastoralGroupDto } from './dto/create-pastoral-group.dto';
import { UpdatePastoralGroupDto } from './dto/update-pastoral-group.dto';

@Injectable()
export class PastoralGroupsService {
  create(createPastoralGroupDto: CreatePastoralGroupDto) {
    return 'This action adds a new pastoralGroup';
  }

  findAll() {
    return `This action returns all pastoralGroups`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pastoralGroup`;
  }

  update(id: number, updatePastoralGroupDto: UpdatePastoralGroupDto) {
    return `This action updates a #${id} pastoralGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} pastoralGroup`;
  }
}
