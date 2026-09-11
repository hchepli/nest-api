import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '../../generated/prisma/client';

const SALT_ROUNDS = 10;
const ADMIN_ROLE_NAME = 'Admin Geral';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: { ...rest, passwordHash },
      });
      return this.excludePassword(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe um usuário com esse email');
      }
      throw error;
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.excludePassword(user));
  }

async findOne(id: string) {
  const user = await this.prisma.user.findUnique({
    where: { id },
    include: {
      role: { select: { id: true, name: true } },
      pastoralGroup: { select: { id: true, name: true } },
    },
  });
  if (!user) {
    throw new NotFoundException(`Usuário com id ${id} não encontrado`);
  }
  return user; // uso interno (ex: AuthService vai precisar do passwordHash aqui)
}

  async findOnePublic(id: string) {
    const user = await this.findOne(id);
    return this.excludePassword(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const currentUser = await this.findOne(id);

    // UC003 (RN004): impedir inativar o último Admin Geral ativo
    if (updateUserDto.status === 'INACTIVE' && currentUser.status === 'ACTIVE') {
      await this.assertNotLastActiveAdmin(currentUser.id, currentUser.roleId);
    }

    try {
      const user = await this.prisma.user.update({ where: { id }, data: updateUserDto });
      return this.excludePassword(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe um usuário com esse email');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const currentUser = await this.findOne(id);

    // Mesma trava do UC003: não deixa remover o último Admin Geral ativo
    if (currentUser.status === 'ACTIVE') {
      await this.assertNotLastActiveAdmin(currentUser.id, currentUser.roleId);
    }

    const user = await this.prisma.user.delete({ where: { id } });
    return this.excludePassword(user);
  }

  private async assertNotLastActiveAdmin(userId: string, roleId: number) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });

    if (role?.name !== ADMIN_ROLE_NAME) {
      return; // não é Admin Geral, não precisa checar
    }

    const activeAdminsCount = await this.prisma.user.count({
      where: { roleId, status: 'ACTIVE' },
    });

    // Se esse é o único ativo (count = 1, ele mesmo), bloqueia
    if (activeAdminsCount <= 1) {
      throw new ForbiddenException(
        'Não é possível inativar/remover o último Admin Geral ativo do sistema.',
      );
    }
  }

  private excludePassword(user: { passwordHash?: string; [key: string]: any }) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}