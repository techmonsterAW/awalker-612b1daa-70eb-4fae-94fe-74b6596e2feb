import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task as TaskEntity } from '../entities';
import { Organization } from '../entities';
import { User } from '../entities';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskCategory } from '@taskmgmt/data';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private taskRepo: Repository<TaskEntity>,
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    private audit: AuditService
  ) {}

  async getTasksForUser(user: User): Promise<Task[]> {
    const orgIds = await this.getOrganizationIdsForUser(user.organizationId);
    const entities = await this.taskRepo.find({
      where: { organizationId: In(orgIds) },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
    await this.auditTaskListRequest(user);
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

  private async auditTaskListRequest(user: User): Promise<void> {
    await this.audit.log(user.id, 'list', 'task', null, 'Task list requested');
  }

  async create(user: User, dto: CreateTaskDto): Promise<Task> {
    const maxOrder = await this.taskRepo
      .createQueryBuilder('t')
      .where('t.organizationId = :orgId', { orgId: user.organizationId })
      .select('MAX(t.order)', 'max')
      .getRawOne<{ max: number | null }>();
    const order = (maxOrder?.max ?? -1) + 1;
    const entity = this.taskRepo.create({
      title: dto.title,
      description: dto.description ?? '',
      status: dto.status ?? TaskStatus.Todo,
      category: dto.category ?? TaskCategory.Work,
      organizationId: user.organizationId,
      createdById: user.id,
      order,
    });
    await this.taskRepo.save(entity);
    await this.audit.log(user.id, 'create', 'task', entity.id, `Task created: ${entity.title}`);
    return this.toTaskDto(entity);
  }

  async update(user: User, taskId: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    const orgIds = await this.getOrganizationIdsForUser(user.organizationId);
    if (!orgIds.includes(task.organizationId)) throw new ForbiddenException('Task not in your organization');
    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.category !== undefined) task.category = dto.category;
    if (dto.order !== undefined) task.order = dto.order;
    await this.taskRepo.save(task);
    await this.audit.log(user.id, 'update', 'task', task.id, `Task updated: ${task.title}`);
    return this.toTaskDto(task);
  }

  async delete(user: User, taskId: string): Promise<void> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    const orgIds = await this.getOrganizationIdsForUser(user.organizationId);
    if (!orgIds.includes(task.organizationId)) throw new ForbiddenException('Task not in your organization');
    await this.audit.log(user.id, 'delete', 'task', taskId, `Task deleted: ${task.title}`);
    await this.taskRepo.remove(task);
  }
}
