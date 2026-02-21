import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasPermission } from './permissions';
import { User } from '../entities';
import { PERMISSION_KEY } from './require-permission.decorator';

@Injectable()
export class PermissionsGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!permission) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user as User | undefined;
    if (!user) throw new ForbiddenException('Not authenticated');
    if (!hasPermission(user.role, permission as any)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
