import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task as TaskEntity } from '../entities';
import { Organization } from '../entities';
import { User } from '../entities';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskCategory } from '@taskmgmt/data';

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
    this.audit('create', user.id, entity.id);
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
    this.audit('update', user.id, task.id);
    return this.toTaskDto(task);
  }

  async delete(user: User, taskId: string): Promise<void> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    const orgIds = await this.getOrganizationIdsForUser(user.organizationId);
    if (!orgIds.includes(task.organizationId)) throw new ForbiddenException('Task not in your organization');
    await this.taskRepo.remove(task);
    this.audit('delete', user.id, taskId);
  }

  private audit(action: string, userId: string, taskId: string): void {
    console.log(`[Audit] User ${userId} ${action} task ${taskId} at ${new Date().toISOString()}`);
  }
}
