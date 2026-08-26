import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client'; // confere esse caminho no seu projeto

describe('RolesService', () => {
  let service: RolesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    role: {
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
        RolesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('deve criar um cargo', async () => {
    const dto = { name: 'Secretaria' };
    const roleEsperado = { id: 1, ...dto };
    mockPrismaService.role.create.mockResolvedValue(roleEsperado);

    const resultado = await service.create(dto);

    expect(resultado).toEqual(roleEsperado);
    expect(prisma.role.create).toHaveBeenCalledWith({ data: dto });
  });

  it('deve lançar ConflictException se o nome já existir (P2002)', async () => {
    const dto = { name: 'Secretaria' };
    const erroPrisma = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002',
      clientVersion: '5.0.0',
    });
    mockPrismaService.role.create.mockRejectedValue(erroPrisma);

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('deve lançar NotFoundException se o cargo não existir', async () => {
    mockPrismaService.role.findUnique.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('deve retornar o cargo quando encontrado', async () => {
    const role = { id: 1, name: 'Admin Geral' };
    mockPrismaService.role.findUnique.mockResolvedValue(role);

    const resultado = await service.findOne(1);

    expect(resultado).toEqual(role);
  });
});