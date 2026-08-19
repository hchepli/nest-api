import { Injectable } from '@nestjs/common';
import { CreateSacramentDto } from './dto/create-sacrament.dto';
import { UpdateSacramentDto } from './dto/update-sacrament.dto';

@Injectable()
export class SacramentsService {
  create(createSacramentDto: CreateSacramentDto) {
    return 'This action adds a new sacrament';
  }

  findAll() {
    return `This action returns all sacraments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sacrament`;
  }

  update(id: number, updateSacramentDto: UpdateSacramentDto) {
    return `This action updates a #${id} sacrament`;
  }

  remove(id: number) {
    return `This action removes a #${id} sacrament`;
  }
}
