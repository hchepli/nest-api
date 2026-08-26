// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('retorna o usuário (sem passwordHash) quando a senha está correta', async () => {
    jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
      id: '6d4c2f31-aace-4c7b-80de-4400f2241d8b',
      name: 'Teste Auth',
      email: 'auth@teste.com',
      passwordHash: '$2b$10$xiyRExRUoEsP0pyIPwK8GOXbZdQKoClalX18IV8DMJLBaQk8hQULW',
      roleId: 1,
      pastoralGroupId: null,
      status: 'ACTIVE',
    } as any);

    const result = await authService.validateUser('auth@teste.com', 'senha12345');

    expect(result).not.toBeNull();
    expect(result).not.toHaveProperty('passwordHash');
    expect(result?.email).toBe('auth@teste.com');
  });

  it('retorna null quando a senha está errada', async () => {
    jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
      id: '6d4c2f31-aace-4c7b-80de-4400f2241d8b',
      passwordHash: '$2b$10$xiyRExRUoEsP0pyIPwK8GOXbZdQKoClalX18IV8DMJLBaQk8hQULW',
    } as any);

    const result = await authService.validateUser('auth@teste.com', 'senhaErrada');
    expect(result).toBeNull();
  });

  it('retorna null quando o email não existe', async () => {
    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

    const result = await authService.validateUser('naoexiste@teste.com', 'qualquer');
    expect(result).toBeNull();
  });
});