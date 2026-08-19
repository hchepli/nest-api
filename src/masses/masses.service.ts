import { Injectable } from '@nestjs/common';
import { CreateMassDto } from './dto/create-mass.dto';
import { UpdateMassDto } from './dto/update-mass.dto';

@Injectable()
export class MassesService {
  create(createMassDto: CreateMassDto) {
    return 'This action adds a new mass';
  }

  findAll() {
    return `This action returns all masses`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mass`;
  }

  update(id: number, updateMassDto: UpdateMassDto) {
    return `This action updates a #${id} mass`;
  }

  remove(id: number) {
    return `This action removes a #${id} mass`;
  }
}
