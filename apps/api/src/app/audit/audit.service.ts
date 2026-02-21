import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities';
import { AuditLogEntry } from '@taskmgmt/data';

const DEFAULT_LIMIT = 200;

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private repo: Repository<AuditLog>
  ) {}

  async log(
    userId: string,
    action: string,
    resourceType: string,
    resourceId?: string | null,
    details?: string | null
  ): Promise<void> {
    const entry = this.repo.create({
      userId,
      action,
      resourceType,
      resourceId: resourceId ?? null,
      details: details ?? null,
    });
    await this.repo.save(entry);
  }

  async getEntries(limit: number = DEFAULT_LIMIT): Promise<AuditLogEntry[]> {
    const rows = await this.repo.find({
      order: { timestamp: 'DESC' },
      take: Math.min(limit, 500),
    });
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      action: r.action,
      resourceType: r.resourceType,
      resourceId: r.resourceId ?? undefined,
      timestamp: r.timestamp instanceof Date ? r.timestamp.toISOString() : String(r.timestamp),
      details: r.details ?? undefined,
    }));
  }
}
