"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = exports.PERMISSIONS = void 0;
exports.PERMISSIONS = {
    TASK_READ: 'task:read',
    TASK_CREATE: 'task:create',
    TASK_UPDATE: 'task:update',
    TASK_DELETE: 'task:delete',
    AUDIT_READ: 'audit:read',
};
const ROLE_PERMISSIONS = {
    owner: [
        exports.PERMISSIONS.TASK_READ,
        exports.PERMISSIONS.TASK_CREATE,
        exports.PERMISSIONS.TASK_UPDATE,
        exports.PERMISSIONS.TASK_DELETE,
        exports.PERMISSIONS.AUDIT_READ,
    ],
    admin: [
        exports.PERMISSIONS.TASK_READ,
        exports.PERMISSIONS.TASK_CREATE,
        exports.PERMISSIONS.TASK_UPDATE,
        exports.PERMISSIONS.TASK_DELETE,
    ],
    viewer: [exports.PERMISSIONS.TASK_READ],
};
function hasPermission(userRole, permission) {
    const role = userRole?.toLowerCase();
    const allowed = ROLE_PERMISSIONS[role];
    return Array.isArray(allowed) && allowed.includes(permission);
}
exports.hasPermission = hasPermission;
//# sourceMappingURL=permissions.js.map