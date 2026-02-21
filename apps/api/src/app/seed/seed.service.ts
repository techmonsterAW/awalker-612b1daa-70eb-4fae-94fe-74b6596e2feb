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

    if (count === 0) {
      await this.seedFull();
      return;
    }

    await this.ensureViewerExists();
  }

  /** Creates Default Org, admin, welcome task, and viewer in same org (runs only when no users exist). */
  private async seedFull(): Promise<void> {
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

    const hash2 = await bcrypt.hash('password123', 10);
    const user2 = this.userRepo.create({
      email: 'viewer@other.org',
      passwordHash: hash2,
      organizationId: org.id,
      role: Role.Viewer,
    });
    await this.userRepo.save(user2);
  }

  /** Ensures viewer@other.org exists in Default Org so they see the same tasks as the admin (read-only). */
  private async ensureViewerExists(): Promise<void> {
    const defaultOrg = await this.orgRepo.findOne({ where: { name: 'Default Org' } });
    if (!defaultOrg) return;

    let viewer = await this.userRepo.findOne({
      where: { email: 'viewer@other.org' },
    });

    if (!viewer) {
      const hash = await bcrypt.hash('password123', 10);
      viewer = this.userRepo.create({
        email: 'viewer@other.org',
        passwordHash: hash,
        organizationId: defaultOrg.id,
        role: Role.Viewer,
      });
      await this.userRepo.save(viewer);
    } else if (viewer.organizationId !== defaultOrg.id) {
      viewer.organizationId = defaultOrg.id;
      await this.userRepo.save(viewer);
    }
  }
}
