import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Prisma } from '../../generated/prisma/client';

interface ScopedUser {
  roleName: string;
  pastoralGroupId: number | null;
}

@Injectable()
export class SchedulesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createScheduleDto: CreateScheduleDto) {
    try {
      return await this.prismaService.schedule.create({
        data: createScheduleDto,
      });
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

  findAll(user: ScopedUser) {
    const where =
      user.roleName === 'Coordenador de Pastoral'
        ? { pastoralGroupId: user.pastoralGroupId }
        : {}; // Admin Geral e Secretaria veem tudo

    return this.prismaService.schedule.findMany({ where });
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