// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return null;
    }

    // RN004/UC007 fluxo 3b: usuário inativo não pode logar
    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

async login(user: { id: string; email: string; roleId: number }) {
  const role = await this.prisma.role.findUnique({ where: { id: user.roleId } });
  const fullUser = await this.prisma.user.findUnique({ where: { id: user.id } });

  const payload = {
    sub: user.id,
    email: user.email,
    roleId: user.roleId,
    roleName: role?.name,
    pastoralGroupId: fullUser?.pastoralGroupId ?? null,
  };

  return {
    access_token: this.jwtService.sign(payload),
  };
}
}