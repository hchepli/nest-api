import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateMassDto } from './dto/create-mass.dto';
import { UpdateMassDto } from './dto/update-mass.dto';
import { LinkPastoralGroupsDto } from './dto/link-pastoral-groups.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { MassQueryDto } from './dto/mass-query.dto';

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

  async findAll(query: MassQueryDto) {
  const { page = 1, limit = 10, search, sortBy, order = 'asc', startDate, endDate } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.MassWhereInput = {
    ...(search && { title: { contains: search, mode: 'insensitive' } }),
    ...((startDate || endDate) && {
      dateTime: {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      },
    }),
  };

  const allowedSortFields = ['dateTime', 'title'];
  const orderBy: Prisma.MassOrderByWithRelationInput = allowedSortFields.includes(sortBy ?? '')
    ? { [sortBy as string]: order }
    : { dateTime: 'asc' };

  const [data, total] = await Promise.all([
    this.prismaService.mass.findMany({ where, skip, take: limit, orderBy }),
    this.prismaService.mass.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
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

  // RN017 (proposta): vincula quais Pastorais participam desta Missa.
  // Substitui o conjunto atual pelo enviado (delete + createMany em transação).
  async linkPastoralGroups(id: number, dto: LinkPastoralGroupsDto) {
    await this.findOne(id);

    try {
      return await this.prismaService.$transaction(async (tx) => {
        await tx.massPastoralGroup.deleteMany({ where: { massId: id } });

        if (dto.pastoralGroupIds.length > 0) {
          await tx.massPastoralGroup.createMany({
            data: dto.pastoralGroupIds.map((pastoralGroupId) => ({
              massId: id,
              pastoralGroupId,
            })),
          });
        }

        return tx.massPastoralGroup.findMany({
          where: { massId: id },
          include: { pastoralGroup: true },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new NotFoundException('Uma ou mais Pastorais informadas não existem.');
      }
      throw error;
    }
  }
}