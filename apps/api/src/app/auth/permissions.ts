/**
 * Inlined from @taskmgmt/auth so the API build does not depend on the auth lib output.
 * Keep in sync with libs/auth/src/lib/permissions.ts.
 */
export const PERMISSIONS = {
  TASK_READ: 'task:read',
  TASK_CREATE: 'task:create',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  AUDIT_READ: 'audit:read',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: [
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.AUDIT_READ,
  ],
  admin: [
    PERMISSIONS.TASK_READ,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_UPDATE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.AUDIT_READ,
  ],
  viewer: [PERMISSIONS.TASK_READ],
};

export function hasPermission(userRole: string, permission: Permission): boolean {
  const role = userRole?.toLowerCase();
  const allowed = ROLE_PERMISSIONS[role];
  return Array.isArray(allowed) && allowed.includes(permission);
}
