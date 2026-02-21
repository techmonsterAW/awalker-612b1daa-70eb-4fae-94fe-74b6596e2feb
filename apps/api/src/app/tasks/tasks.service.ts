import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task as TaskEntity } from '../entities';
import { Organization } from '../entities';
import { User } from '../entities';
import { Task } from '@taskmgmt/data';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private taskRepo: Repository<TaskEntity>,
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>
  ) {}

  async getTasksForUser(user: User): Promise<Task[]> {
    const orgIds = await this.getOrganizationIdsForUser(user.organizationId);
    const entities = await this.taskRepo.find({
      where: { organizationId: In(orgIds) },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
    this.auditTaskListRequest(user);
    return entities.map((e) => this.toTaskDto(e));
  }

  private async getOrganizationIdsForUser(organizationId: string): Promise<string[]> {
    const children = await this.orgRepo.find({
      where: { parentId: organizationId },
      select: ['id'],
    });
    return [organizationId, ...children.map((c) => c.id)];
  }

  private toTaskDto(e: TaskEntity): Task {
    return {
      id: e.id,
      title: e.title,
      description: e.description ?? '',
      status: e.status,
      category: e.category,
      organizationId: e.organizationId,
      createdById: e.createdById,
      order: e.order,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    };
  }

  private auditTaskListRequest(user: User): void {
    console.log(`[Audit] User ${user.email} (id: ${user.id}) requested task list`);
  }
}
