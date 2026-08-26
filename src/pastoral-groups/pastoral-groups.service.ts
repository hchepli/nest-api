import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { CreatePastoralGroupDto } from './dto/create-pastoral-group.dto';
import { UpdatePastoralGroupDto } from './dto/update-pastoral-group.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';

interface ScopedUser {
  roleName: string;
  pastoralGroupId: number | null;
}

@Injectable()
export class PastoralGroupsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createPastoralGroupDto: CreatePastoralGroupDto) {
    try {
      return await this.prismaService.pastoralGroup.create({ data: createPastoralGroupDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe um grupo pastoral com esse nome');
      }
      throw error;
    }
  }

  findAll() {
    return this.prismaService.pastoralGroup.findMany();
  }

  async findOne(id: number) {
    const pastoralGroup = await this.prismaService.pastoralGroup.findUnique({
      where: { id },
    });
    if (!pastoralGroup) {
      throw new NotFoundException('Grupo pastoral não encontrado');
    }
    return pastoralGroup;
  }

  async update(id: number, updatePastoralGroupDto: UpdatePastoralGroupDto, user: ScopedUser) {
    await this.findOne(id); // valida existência

    // RN006: Coordenador só edita a própria pastoral
    if (user.roleName === 'Coordenador de Pastoral' && id !== user.pastoralGroupId) {
      throw new ForbiddenException('Você só pode editar sua própria pastoral.');
    }

    try {
      return await this.prismaService.pastoralGroup.update({ where: { id }, data: updatePastoralGroupDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe um grupo pastoral com esse nome');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.pastoralGroup.delete({ where: { id } });
  }
}