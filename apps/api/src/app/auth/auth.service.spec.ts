import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from '../entities';
import { AuditService } from '../audit/audit.service';
import { Role } from '@taskmgmt/data';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: { findOne: jest.Mock };
  let jwtSign: jest.Mock;
  const auditLog = jest.fn().mockResolvedValue(undefined);

  const mockUser = {
    id: 'user-1',
    email: 'admin@example.com',
    passwordHash: '',
    organizationId: 'org-1',
    role: Role.Admin,
  };

  beforeAll(async () => {
    mockUser.passwordHash = await bcrypt.hash('password123', 10);
  });

  beforeEach(async () => {
    userRepo = { findOne: jest.fn() };
    jwtSign = jest.fn().mockReturnValue('fake-jwt-token');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: JwtService, useValue: { sign: jwtSign } },
        { provide: AuditService, useValue: { log: auditLog } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('login returns token and user for valid credentials', async () => {
    userRepo.findOne.mockResolvedValue(mockUser);

    const result = await service.login({
      email: 'admin@example.com',
      password: 'password123',
    });

    expect(result.accessToken).toBe('fake-jwt-token');
    expect(result.user.email).toBe('admin@example.com');
    expect(result.user.role).toBe(Role.Admin);
    expect(jwtSign).toHaveBeenCalled();
  });

  it('login throws UnauthorizedException for invalid password', async () => {
    userRepo.findOne.mockResolvedValue(mockUser);

    await expect(
      service.login({ email: 'admin@example.com', password: 'wrong' })
    ).rejects.toThrow(UnauthorizedException);
    expect(jwtSign).not.toHaveBeenCalled();
  });

  it('login throws UnauthorizedException when user not found', async () => {
    userRepo.findOne.mockResolvedValue(null);

    await expect(
      service.login({ email: 'nobody@example.com', password: 'password123' })
    ).rejects.toThrow(UnauthorizedException);
  });
});
