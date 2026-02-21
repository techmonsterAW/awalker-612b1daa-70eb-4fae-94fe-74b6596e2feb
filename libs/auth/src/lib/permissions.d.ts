export declare const PERMISSIONS: {
    readonly TASK_READ: "task:read";
    readonly TASK_CREATE: "task:create";
    readonly TASK_UPDATE: "task:update";
    readonly TASK_DELETE: "task:delete";
    readonly AUDIT_READ: "audit:read";
};
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export declare function hasPermission(userRole: string, permission: Permission): boolean;
//# sourceMappingURL=permissions.d.ts.map