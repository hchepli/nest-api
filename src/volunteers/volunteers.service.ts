import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';

interface ScopedUser {
  roleName: string;
  pastoralGroupId: number | null;
}

@Injectable()
export class VolunteersService {
  constructor(private readonly prismaService: PrismaService) {}

async create(createVolunteerDto: CreateVolunteerDto, user: ScopedUser) {
  const { pastoralGroupId, ...rest } = createVolunteerDto;

  if (user.roleName === 'Coordenador de Pastoral') {
    if (!user.pastoralGroupId || pastoralGroupId !== user.pastoralGroupId) {
      throw new ForbiddenException(
        'Você só pode cadastrar Voluntários para a sua própria Pastoral (RN006).',
      );
    }
  }

  try {
    return await this.prismaService.volunteer.create({
      data: {
        ...rest,
        pastoralGroup: { connect: { id: pastoralGroupId } },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Já existe um voluntário com esse email');
      }
      if (error.code === 'P2025' || error.code === 'P2003') {
        throw new ConflictException('Pastoral informada não existe.');
      }
    }
    throw error;
  }
}

  findAll(pastoralGroupId?: number) {
    return this.prismaService.volunteer.findMany({
      where: pastoralGroupId ? { pastoralGroupId } : undefined,
    });
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

  async update(id: number, updateVolunteerDto: UpdateVolunteerDto, user: ScopedUser) {
  const volunteer = await this.findOne(id);

  if (user.roleName === 'Coordenador de Pastoral') {
    if (!user.pastoralGroupId || volunteer.pastoralGroupId !== user.pastoralGroupId) {
      throw new ForbiddenException('Você não tem acesso a este Voluntário.');
    }
    if (
      updateVolunteerDto.pastoralGroupId !== undefined &&
      updateVolunteerDto.pastoralGroupId !== user.pastoralGroupId
    ) {
      throw new ForbiddenException('Você não pode mover um Voluntário para outra Pastoral (RN006).');
    }
  }

  const { pastoralGroupId, ...rest } = updateVolunteerDto;

  try {
    return this.prismaService.volunteer.update({
      where: { id },
      data: {
        ...rest,
        ...(pastoralGroupId !== undefined && {
          pastoralGroup: { connect: { id: pastoralGroupId } },
        }),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Já existe um voluntário com esse email');
      }
      if (error.code === 'P2025' || error.code === 'P2003') {
        throw new ConflictException('Pastoral informada não existe.');
      }
    }
    throw error;
  }
}

  async remove(id: number, user: ScopedUser) {
    const volunteer = await this.findOne(id);

    if (
      user.roleName === 'Coordenador de Pastoral' &&
      volunteer.pastoralGroupId !== user.pastoralGroupId
    ) {
      throw new ForbiddenException('Você não tem acesso a este Voluntário.');
    }

    return this.prismaService.volunteer.delete({ where: { id } });
  }
}