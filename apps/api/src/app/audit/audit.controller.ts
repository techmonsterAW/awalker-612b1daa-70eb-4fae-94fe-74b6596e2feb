import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { RequirePermission } from '../auth/require-permission.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PERMISSIONS } from '../auth/permissions';
import { AuditLogEntry } from '@taskmgmt/data';
import { Request } from 'express';
import { User } from '../entities';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private audit: AuditService) {}

  @Get()
  @RequirePermission(PERMISSIONS.AUDIT_READ)
  async list(
    @Req() req: Request & { user: User },
    @Query('limit') limit?: string
  ): Promise<AuditLogEntry[]> {
    const entries = await this.audit.getEntries(limit ? parseInt(limit, 10) : undefined);
    await this.audit.log(req.user.id, 'view', 'audit_log', null, 'Audit log accessed');
    return entries;
  }
}
