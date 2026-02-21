export interface AuditLogEntry {
    id: string;
    userId: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    timestamp: string;
    details?: string;
}
//# sourceMappingURL=audit.dto.d.ts.map