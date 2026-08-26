import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class PermissionService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createPermissionDto: CreatePermissionDto) {
    try {
      return await this.prismaService.permission.create({ data: createPermissionDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe uma permissão com esse nome');
      }
      throw error;
    }
  }

  findAll() {
    return this.prismaService.permission.findMany();
  }

  async findOne(id: number) {
    const permission = await this.prismaService.permission.findUnique({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException('Permissão não encontrada');
    }
    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    await this.findOne(id);
    try {
      return await this.prismaService.permission.update({ where: { id }, data: updatePermissionDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe uma permissão com esse nome');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.permission.delete({ where: { id } });
  }
}
