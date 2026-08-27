import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Event } from '../../generated/prisma/client';
import { generateSlug } from '../common/utils/slug.util';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Injectable()
export class EventsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    const { slug, ...rest } = createEventDto;
    const finalSlug = slug ?? generateSlug(rest.name);

    try {
      return await this.prismaService.event.create({
        data: { ...rest, slug: finalSlug },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe um evento com esse nome');
      }
      throw error;
    }
  }

  // Uso público (site institucional) - não lista eventos CANCELLED,
  // que continuam acessíveis via findOne (rota específica), só não
  // aparecem na listagem geral.
async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Event>> {
  const { page = 1, limit = 10, search, sortBy, order = 'desc' } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.EventWhereInput = {
    status: 'ACTIVE',
    ...(search && {
      name: { contains: search, mode: 'insensitive' },
    }),
  };

  const allowedSortFields = ['startDate', 'name'] as const;
  const finalSortBy = allowedSortFields.includes(sortBy as any) ? sortBy : 'startDate';
  const orderBy = { [finalSortBy as string]: order };

  const [data, total] = await Promise.all([
    this.prismaService.event.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    this.prismaService.event.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

  // Sem filtro de status - evento cancelado continua acessível
  // diretamente pela própria página/rota (não é escondido, só não
  // aparece na listagem geral).
  async findOne(id: number) {
    const event = await this.prismaService.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    await this.findOne(id);
    try {
      return await this.prismaService.event.update({ where: { id }, data: updateEventDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe um evento com esse nome');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.event.delete({ where: { id } });
  }
}