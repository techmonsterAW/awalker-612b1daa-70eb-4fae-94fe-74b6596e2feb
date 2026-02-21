import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { RequirePermission } from '../auth/require-permission.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PERMISSIONS } from '../auth/permissions';
import { Task } from '@taskmgmt/data';
import { Request } from 'express';
import { User } from '../entities';

@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission(PERMISSIONS.TASK_READ)
export class TasksController {
  constructor(private tasks: TasksService) {}

  @Get()
  async list(@Req() req: Request & { user: User }): Promise<Task[]> {
    return this.tasks.getTasksForUser(req.user);
  }
}
