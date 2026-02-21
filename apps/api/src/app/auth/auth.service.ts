import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities';
import { LoginRequest, LoginResponse, UserView } from '@taskmgmt/data';
import { Role } from '@taskmgmt/data';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwt: JwtService
  ) {}

  async login(dto: LoginRequest): Promise<LoginResponse> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email, role: user.role, organizationId: user.organizationId };
    const accessToken = this.jwt.sign(payload);
    const userView: UserView = {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      organizationId: user.organizationId,
    };
    return { accessToken, user: userView };
  }

  async validatePayload(payload: { sub: string; email: string; role: string; organizationId: string }): Promise<User | null> {
    return this.userRepo.findOne({ where: { id: payload.sub } });
  }
}
