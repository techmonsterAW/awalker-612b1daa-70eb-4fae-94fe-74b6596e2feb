import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { Role } from '@taskmgmt/data';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    @InjectRepository(User)
    private userRepo: Repository<User>
  ) {}

  async onModuleInit() {
    if (process.env['SKIP_SEED'] === 'true') return;
    const count = await this.userRepo.count();
    if (count > 0) return;

    const org = this.orgRepo.create({ name: 'Default Org', parentId: null });
    await this.orgRepo.save(org);

    const hash = await bcrypt.hash('password123', 10);
    const user = this.userRepo.create({
      email: 'admin@example.com',
      passwordHash: hash,
      organizationId: org.id,
      role: Role.Admin,
    });
    await this.userRepo.save(user);
  }
}
