import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateMassDto } from './dto/create-mass.dto';
import { UpdateMassDto } from './dto/update-mass.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class MassesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createMassDto: CreateMassDto) {
    try {
      return await this.prismaService.mass.create({ data: createMassDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe uma missa com esse nome');
      }
      throw error;
    }
  }

  findAll() {
    return this.prismaService.mass.findMany();
  }

  async findOne(id: number) {
    const mass = await this.prismaService.mass.findUnique({
      where: { id },
    });
    if (!mass) {
      throw new NotFoundException('Missa não encontrada');
    }
    return mass;
  }

  async update(id: number, updateMassDto: UpdateMassDto) {
    await this.findOne(id);
    try {
      return await this.prismaService.mass.update({ where: { id }, data: updateMassDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe uma missa com esse nome');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.mass.delete({ where: { id } });
  }
}
