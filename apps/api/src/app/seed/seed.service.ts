import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { Task } from '../entities/task.entity';
import { Role, TaskStatus, TaskCategory } from '@taskmgmt/data';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Task)
    private taskRepo: Repository<Task>
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

    const task = this.taskRepo.create({
      title: 'Welcome task',
      description: 'Get familiar with the task list. This task was created by the seed.',
      status: TaskStatus.Todo,
      category: TaskCategory.Work,
      organizationId: org.id,
      createdById: user.id,
      order: 0,
    });
    await this.taskRepo.save(task);

    const org2 = this.orgRepo.create({ name: 'Other Org', parentId: null });
    await this.orgRepo.save(org2);
    const hash2 = await bcrypt.hash('password123', 10);
    const user2 = this.userRepo.create({
      email: 'viewer@other.org',
      passwordHash: hash2,
      organizationId: org2.id,
      role: Role.Viewer,
    });
    await this.userRepo.save(user2);
  }
}
