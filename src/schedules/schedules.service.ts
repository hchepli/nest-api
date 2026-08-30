import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleQueryDto } from './dto/schedule-query.dto';
import { Prisma } from '../../generated/prisma/client';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

interface ScopedUser {
  roleName: string;
  pastoralGroupId: number | null;
}

@Injectable()
export class SchedulesService {
  constructor(private readonly prismaService: PrismaService) {}

async create(createScheduleDto: CreateScheduleDto, user: ScopedUser) {
  const { massId, eventId, assignments = [], pastoralGroupId: manualPastoralGroupId } = createScheduleDto;

  const hasMass = massId !== undefined && massId !== null;
  const hasEvent = eventId !== undefined && eventId !== null;

  if (hasMass === hasEvent) {
    throw new BadRequestException(
      'A Escala deve estar vinculada a uma Missa OU a um Evento, nunca ambos nem nenhum (RN007).',
    );
  }

  const seen = new Set<string>();
  for (const a of assignments) {
    const key = `${a.volunteerId}:${a.role}`;
    if (seen.has(key)) {
      throw new BadRequestException(
        `Atribuição duplicada no request: volunteerId=${a.volunteerId}, role="${a.role}".`,
      );
    }
    seen.add(key);
  }

  // RN006/RN017: define o pastoralGroupId final da Escala.
  let finalPastoralGroupId: number | null = null;

  if (user.roleName === 'Coordenador de Pastoral') {
    // Automático a partir do usuário logado — Coordenador não escolhe.
    finalPastoralGroupId = user.pastoralGroupId;

    // Busca as pastorais vinculadas à Mass/Event informado (RN017).
    const linkedPastoralGroupIds = hasMass
      ? (
          await this.prismaService.massPastoralGroup.findMany({
            where: { massId },
            select: { pastoralGroupId: true },
          })
        ).map((r) => r.pastoralGroupId)
      : (
          await this.prismaService.eventPastoralGroup.findMany({
            where: { eventId },
            select: { pastoralGroupId: true },
          })
        ).map((r) => r.pastoralGroupId);

    if (
      !user.pastoralGroupId ||
      !linkedPastoralGroupIds.includes(user.pastoralGroupId)
    ) {
      throw new ForbiddenException(
        'Sua Pastoral não está vinculada a esta Missa/Evento — você não pode criar Escala aqui (RN006/RN017).',
      );
    }
  } else {
    // Admin Geral/Secretaria: pastoralGroupId manual e opcional.
    finalPastoralGroupId = manualPastoralGroupId ?? null;

    // Se informado manualmente, precisa ser coerente com o vínculo
    // da Mass/Event (RN017) — não só bater com o usuário, mas o dado
    // em si precisa fazer sentido.
    if (finalPastoralGroupId !== null) {
      const linkedPastoralGroupIds = hasMass
        ? (
            await this.prismaService.massPastoralGroup.findMany({
              where: { massId },
              select: { pastoralGroupId: true },
            })
          ).map((r) => r.pastoralGroupId)
        : (
            await this.prismaService.eventPastoralGroup.findMany({
              where: { eventId },
              select: { pastoralGroupId: true },
            })
          ).map((r) => r.pastoralGroupId);

      if (!linkedPastoralGroupIds.includes(finalPastoralGroupId)) {
        throw new BadRequestException(
          'A Pastoral informada não está vinculada à Missa/Evento selecionado (RN017).',
        );
      }
    }
  }

  try {
    return await this.prismaService.$transaction(async (tx) => {
      const schedule = await tx.schedule.create({
        data: {
          massId: massId ?? null,
          eventId: eventId ?? null,
          pastoralGroupId: finalPastoralGroupId,
        },
      });

      if (assignments.length > 0) {
        await tx.scheduleAssignment.createMany({
          data: assignments.map((a) => ({
            scheduleId: schedule.id,
            volunteerId: a.volunteerId,
            role: a.role,
          })),
        });
      }

      return tx.schedule.findUniqueOrThrow({
        where: { id: schedule.id },
        include: { assignments: true },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Missa, Evento ou algum Voluntário informado nas atribuições não existe.',
        );
      }
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Atribuição duplicada (mesmo voluntário + função na mesma escala).',
        );
      }
    }
    throw error;
  }
}

  async findAll(user: ScopedUser, query: ScheduleQueryDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, massId, eventId, volunteerId, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    // Escopo por pastoral (RN006/RN008) - mesma regra de antes, aplicada primeiro
    const scopeWhere: Prisma.ScheduleWhereInput =
      user.roleName === 'Coordenador de Pastoral'
        ? { pastoralGroupId: user.pastoralGroupId }
        : {};

    // Filtros adicionais do relatório (RF008/UC023)
    const filterWhere: Prisma.ScheduleWhereInput = {
      ...(massId && { massId }),
      ...(eventId && { eventId }),
      ...(volunteerId && {
        assignments: { some: { volunteerId } },
      }),
      ...((startDate || endDate) && {
        OR: [
          {
            mass: {
              dateTime: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) }),
              },
            },
          },
          {
            event: {
              startDate: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) }),
              },
            },
          },
        ],
      }),
    };

    // Combina escopo + filtros com AND explícito, pra garantir que o
    // Coordenador NUNCA escape do próprio escopo mesmo filtrando por
    // massId/eventId/volunteerId de fora da sua pastoral.
    const where: Prisma.ScheduleWhereInput = {
      AND: [scopeWhere, filterWhere],
    };

    const [data, total] = await Promise.all([
      this.prismaService.schedule.findMany({
        where,
        skip,
        take: limit,
        include: { assignments: true },
      }),
      this.prismaService.schedule.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllForExport(user: ScopedUser, query: ScheduleQueryDto) {
  const { massId, eventId, volunteerId, startDate, endDate } = query;

  // Escopo por pastoral (RN006/RN008) - idêntico ao findAll
  const scopeWhere: Prisma.ScheduleWhereInput =
    user.roleName === 'Coordenador de Pastoral'
      ? { pastoralGroupId: user.pastoralGroupId }
      : {};

  // Filtros do relatório - idêntico ao findAll
  const filterWhere: Prisma.ScheduleWhereInput = {
    ...(massId && { massId }),
    ...(eventId && { eventId }),
    ...(volunteerId && {
      assignments: { some: { volunteerId } },
    }),
    ...((startDate || endDate) && {
      OR: [
        {
          mass: {
            dateTime: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          },
        },
        {
          event: {
            startDate: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          },
        },
      ],
    }),
  };

  const where: Prisma.ScheduleWhereInput = {
    AND: [scopeWhere, filterWhere],
  };

  // Sem skip/take - retorna o conjunto completo filtrado.
  // Includes necessários pra montar as colunas do relatório.
  return this.prismaService.schedule.findMany({
    where,
    include: {
      mass: { select: { title: true, dateTime: true } },
      event: { select: { name: true, startDate: true } },
      pastoralGroup: { select: { name: true } },
      assignments: {
        include: {
          volunteer: { select: { name: true } },
        },
      },
    },
    orderBy: [{ mass: { dateTime: 'asc' } }, { event: { startDate: 'asc' } }],
  });
}

  async findOne(id: string, user: ScopedUser) {
    const schedule = await this.prismaService.schedule.findUnique({ where: { id } });

    if (!schedule) {
      throw new NotFoundException('Escala não encontrada');
    }

    if (
      user.roleName === 'Coordenador de Pastoral' &&
      schedule.pastoralGroupId !== user.pastoralGroupId
    ) {
      throw new ForbiddenException('Você não tem acesso a esta escala.');
    }

    return schedule;
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto, user: ScopedUser) {
    await this.findOne(id, user);
    try {
      return await this.prismaService.schedule.update({ where: { id }, data: updateScheduleDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Já existe uma escala com esse horário, data e função');
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('Missa, Evento ou Pastoral informado(a) não existe.');
        }
      }
      throw error;
    }
  }

  async remove(id: string, user: ScopedUser) {
    await this.findOne(id, user);
    return this.prismaService.schedule.delete({ where: { id } });
  }
}