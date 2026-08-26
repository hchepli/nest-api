import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateScheduleAssignmentDto } from './dto/create-schedule-assignment.dto';
import { UpdateScheduleAssignmentDto } from './dto/update-schedule-assignment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class ScheduleAssignmentService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createScheduleAssignmentDto: CreateScheduleAssignmentDto) {
    try {
      return await this.prismaService.scheduleAssignment.create({ data: createScheduleAssignmentDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe uma atribuição de horário com essas características');
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prismaService.scheduleAssignment.findMany();
  }

  async findOne(id: number) {
    const scheduleAssignment = await this.prismaService.scheduleAssignment.findUnique({
      where: { id },
    });
    if (!scheduleAssignment) {
      throw new NotFoundException('Atribuição de horário não encontrada');
    }
    return scheduleAssignment;
  }

  async update(id: number, updateScheduleAssignmentDto: UpdateScheduleAssignmentDto) {
    await this.findOne(id);
    try {
      return await this.prismaService.scheduleAssignment.update({ where: { id }, data: updateScheduleAssignmentDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe uma atribuição de horário com essas características');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.prismaService.scheduleAssignment.delete({ where: { id } });
  }
}
