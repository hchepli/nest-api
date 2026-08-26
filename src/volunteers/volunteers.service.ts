import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class VolunteersService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createVolunteerDto: CreateVolunteerDto) {
    try{
      return await this.prismaService.volunteer.create({ data: createVolunteerDto,
      });
    } catch (error){
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe um voluntário com esse email');
      }
      throw error;
    }
  }

  findAll() {
    return this.prismaService.volunteer.findMany();
  }

  async findOne(id: number) {
    const volunteer = await this.prismaService.volunteer.findUnique({
      where: { id },
    });
    if (!volunteer) {
      throw new NotFoundException('Voluntário não encontrado');
    }
    return volunteer;
  }

  async update(id: number, updateVolunteerDto: UpdateVolunteerDto) {
    await this.findOne(id);
    try{
          return this.prismaService.volunteer.update({ where: { id }, data: updateVolunteerDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe um voluntário com esse email');
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prismaService.volunteer.delete({ where: { id } });
  }
}
