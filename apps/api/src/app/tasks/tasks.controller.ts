import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { RequirePermission } from '../auth/require-permission.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PERMISSIONS } from '../auth/permissions';
import { Task, CreateTaskDto, UpdateTaskDto } from '@taskmgmt/data';
import { Request } from 'express';
import { User } from '../entities';

@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TasksController {
  constructor(private tasks: TasksService) {}

  @Get()
  @RequirePermission(PERMISSIONS.TASK_READ)
  async list(@Req() req: Request & { user: User }): Promise<Task[]> {
    return this.tasks.getTasksForUser(req.user);
  }

  @Post()
  @RequirePermission(PERMISSIONS.TASK_CREATE)
  async create(@Req() req: Request & { user: User }, @Body() dto: CreateTaskDto): Promise<Task> {
    return this.tasks.create(req.user, dto);
  }

  @Put(':id')
  @RequirePermission(PERMISSIONS.TASK_UPDATE)
  async update(
    @Req() req: Request & { user: User },
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto
  ): Promise<Task> {
    return this.tasks.update(req.user, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSIONS.TASK_DELETE)
  async delete(@Req() req: Request & { user: User }, @Param('id') id: string): Promise<void> {
    return this.tasks.delete(req.user, id);
  }
}
