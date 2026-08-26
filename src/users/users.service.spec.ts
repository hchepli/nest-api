import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('deve criar um usuário mapeando password para passwordHash', async () => {
    const dto = {
      name: 'Teste Auth',
      email: 'auth@teste.com',
      password: 'senha12345',
      roleId: 1,
    };
    const userCriado = {
      id: 'uuid-fake-123',
      name: dto.name,
      email: dto.email,
      passwordHash: dto.password,
      roleId: dto.roleId,
    };
    mockPrismaService.user.create.mockResolvedValue(userCriado);

    const resultado = await service.create(dto);

    expect(resultado).toEqual(userCriado);
    // confirma que o Prisma foi chamado com passwordHash, não com password
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: dto.name,
        email: dto.email,
        roleId: dto.roleId,
        passwordHash: dto.password,
      },
    });
  });

  it('deve lançar ConflictException se o email já existir (P2002)', async () => {
    const dto = {
      name: 'Teste Auth',
      email: 'auth@teste.com',
      password: 'senha12345',
      roleId: 1,
    };
    const erroPrisma = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002',
      clientVersion: '5.0.0',
    });
    mockPrismaService.user.create.mockRejectedValue(erroPrisma);

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('deve lançar NotFoundException se o usuário não existir (id UUID)', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(service.findOne('id-que-nao-existe')).rejects.toThrow(NotFoundException);
  });

  it('deve retornar o usuário quando encontrado', async () => {
    const user = {
      id: 'uuid-fake-123',
      name: 'Admin',
      email: 'admin@teste.com',
      passwordHash: 'algumhash',
      roleId: 1,
    };
    mockPrismaService.user.findUnique.mockResolvedValue(user);

    const resultado = await service.findOne('uuid-fake-123');

    expect(resultado).toEqual(user);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid-fake-123' } });
  });
});