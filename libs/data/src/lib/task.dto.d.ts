import { TaskStatus, TaskCategory } from './enums';
export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    category: TaskCategory;
    organizationId: string;
    createdById: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}
export interface CreateTaskDto {
    title: string;
    description?: string;
    status?: TaskStatus;
    category?: TaskCategory;
}
export interface UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    category?: TaskCategory;
    order?: number;
}
//# sourceMappingURL=task.dto.d.ts.map