import { ChangeDetectorRef, Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TaskService } from './task.service';
import { Task, TaskStatus, TaskCategory, Role, CreateTaskDto, UpdateTaskDto } from '@taskmgmt/data';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tasks-placeholder',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, DragDropModule],
  template: `
    <div class="relative z-10 flex min-h-screen flex-col">
      <header class="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-base-elevated px-4 py-3 sm:px-6 sm:py-4">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-accent to-emerald-500 shadow-lg shadow-emerald-500/30"></div>
          <span class="text-lg font-bold tracking-tight text-slate-100">Task Management</span>
        </div>
        <div class="flex flex-wrap items-center gap-2 sm:gap-4">
          @if (canViewAudit) {
            <a
              routerLink="/audit"
              class="rounded-lg px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
            >
              Audit log
            </a>
          }
          <span class="rounded-lg bg-base-input px-3 py-1.5 text-sm text-slate-400">{{ currentEmail }}</span>
          <button
            type="button"
            class="rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-semibold text-slate-400 transition hover:border-white/20 hover:bg-white/5 hover:text-slate-100"
            (click)="logout()"
          >
            Log out
          </button>
        </div>
      </header>
      <main class="flex-1 p-4 sm:p-6">
        <div class="mx-auto max-w-3xl">
          <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 class="text-xl font-bold tracking-tight text-slate-100">Tasks</h2>
            @if (canManageTasks) {
              <button
                type="button"
                class="w-full rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-90 sm:w-auto"
                (click)="openCreate()"
              >
                Add task
              </button>
            }
          </div>

          <div class="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-base-card p-3">
            <span class="text-xs font-medium text-slate-500 sm:text-sm">Sort:</span>
            <select
              [ngModel]="sortBy()"
              (ngModelChange)="sortBy.set($event)"
              class="rounded-lg border border-white/10 bg-base-input px-3 py-1.5 text-sm text-slate-200 focus:border-accent focus:outline-none"
            >
              <option value="default">Default order</option>
              <option value="dateDesc">Date (newest)</option>
              <option value="dateAsc">Date (oldest)</option>
              <option value="status">Status</option>
              <option value="titleAsc">Title (A–Z)</option>
              <option value="titleDesc">Title (Z–A)</option>
            </select>
            <span class="ml-2 text-xs font-medium text-slate-500 sm:ml-0 sm:text-sm">Filter:</span>
            <select
              [ngModel]="filterStatus()"
              (ngModelChange)="filterStatus.set($event)"
              class="rounded-lg border border-white/10 bg-base-input px-3 py-1.5 text-sm text-slate-200 focus:border-accent focus:outline-none"
            >
              <option value="">All statuses</option>
              <option [value]="TaskStatus.Todo">To do</option>
              <option [value]="TaskStatus.InProgress">In progress</option>
              <option [value]="TaskStatus.Done">Done</option>
            </select>
            <select
              [ngModel]="filterCategory()"
              (ngModelChange)="filterCategory.set($event)"
              class="rounded-lg border border-white/10 bg-base-input px-3 py-1.5 text-sm text-slate-200 focus:border-accent focus:outline-none"
            >
              <option value="">All categories</option>
              <option [value]="TaskCategory.Work">Work</option>
              <option [value]="TaskCategory.Personal">Personal</option>
            </select>
          </div>

          @if (loading) {
            <div class="flex justify-center py-12">
              <span class="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent"></span>
            </div>
          } @else if (error) {
            <div class="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {{ error }}
            </div>
          } @else if (displayedTasks().length === 0) {
            <p class="rounded-xl border border-white/10 bg-base-card p-6 text-center text-slate-400">
              {{ tasks().length === 0 ? 'No tasks yet. Tasks you create will appear here.' : 'No tasks match the current filters.' }}
            </p>
          } @else {
            <ul
              cdkDropList
              cdkDropListOrientation="vertical"
              [cdkDropListDisabled]="!canReorder()"
              (cdkDropListDropped)="onDrop($event)"
              class="space-y-3"
            >
              @for (task of displayedTasks(); track task.id) {
                <li
                  cdkDrag
                  (cdkDragEnded)="onDragEnd()"
                  class="rounded-xl border border-white/10 bg-base-card p-4 transition hover:border-white/15"
                >
                  <div class="task-card-content flex items-start gap-3">
                    @if (canReorder()) {
                      <div class="flex shrink-0 cursor-grab touch-none active:cursor-grabbing" cdkDragHandle>
                        <span class="text-slate-500">⋮⋮</span>
                      </div>
                    }
                    <div class="min-w-0 flex-1">
                      <h3 class="font-semibold text-slate-100">{{ task.title }}</h3>
                      @if (task.description) {
                        <p class="mt-1 text-sm text-slate-400 line-clamp-2">{{ task.description }}</p>
                      }
                      <div class="mt-2 flex flex-wrap items-center gap-2">
                        @if (canManageTasks) {
                          <select
                            [value]="task.status"
                            (change)="updateTaskStatus(task, $any($event.target).value)"
                            class="rounded border border-white/10 bg-base-input px-2 py-0.5 text-xs text-slate-300 focus:border-accent focus:outline-none"
                          >
                            <option [value]="TaskStatus.Todo">To do</option>
                            <option [value]="TaskStatus.InProgress">In progress</option>
                            <option [value]="TaskStatus.Done">Done</option>
                          </select>
                        } @else {
                          <span [class]="statusClass(task.status)">{{ formatStatus(task.status) }}</span>
                        }
                        <span class="rounded bg-base-input px-2 py-0.5 text-xs text-slate-400">{{ formatCategory(task.category) }}</span>
                        @if (canManageTasks) {
                          <button
                            type="button"
                            class="text-xs font-medium text-slate-400 hover:text-accent"
                            (click)="openEdit(task)"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            class="text-xs font-medium text-slate-400 hover:text-red-400"
                            (click)="confirmDelete(task)"
                          >
                            Delete
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                </li>
              }
            </ul>
          }
        </div>
      </main>

      @if (showModal) {
        <div class="fixed inset-0 z-20 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" (click)="closeModal()">
          <div class="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl border border-white/10 bg-base-card p-6 shadow-xl sm:max-w-md sm:rounded-2xl sm:max-h-none" (click)="$event.stopPropagation()">
            <h3 class="mb-4 text-lg font-semibold text-slate-100">{{ editingTask ? 'Edit task' : 'New task' }}</h3>
            <form [formGroup]="taskForm" (ngSubmit)="saveTask()">
              <div class="space-y-4">
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-400">Title</label>
                  <input
                    formControlName="title"
                    class="w-full rounded-xl border border-white/10 bg-base-input px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-accent focus:outline-none"
                    placeholder="Task title"
                  />
                  @if (taskForm.get('title')?.invalid && taskForm.get('title')?.touched) {
                    <p class="mt-1 text-xs text-red-400">Title is required</p>
                  }
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-400">Description</label>
                  <textarea
                    formControlName="description"
                    rows="3"
                    class="w-full rounded-xl border border-white/10 bg-base-input px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-accent focus:outline-none"
                    placeholder="Optional description"
                  ></textarea>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-400">Status</label>
                  <select
                    formControlName="status"
                    class="w-full rounded-xl border border-white/10 bg-base-input px-4 py-2 text-slate-100 focus:border-accent focus:outline-none"
                  >
                    <option [ngValue]="TaskStatus.Todo">To do</option>
                    <option [ngValue]="TaskStatus.InProgress">In progress</option>
                    <option [ngValue]="TaskStatus.Done">Done</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-400">Category</label>
                  <select
                    formControlName="category"
                    class="w-full rounded-xl border border-white/10 bg-base-input px-4 py-2 text-slate-100 focus:border-accent focus:outline-none"
                  >
                    <option [ngValue]="TaskCategory.Work">Work</option>
                    <option [ngValue]="TaskCategory.Personal">Personal</option>
                  </select>
                </div>
              </div>
              <div class="mt-6 flex justify-end gap-2">
                <button type="button" class="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-400 hover:bg-white/5" (click)="closeModal()">
                  Cancel
                </button>
                <button type="submit" [disabled]="taskForm.invalid || saving" class="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50">
                  {{ saving ? 'Saving…' : (editingTask ? 'Update' : 'Create') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class TasksPlaceholderComponent implements OnInit {
  tasks = signal<Task[]>([]);
  loading = true;
  error = '';
  currentEmail = '';
  showModal = false;
  editingTask: Task | null = null;
  saving = false;
  TaskStatus = TaskStatus;
  TaskCategory = TaskCategory;

  sortBy = signal<string>('default');
  filterStatus = signal<string>('');
  filterCategory = signal<string>('');

  displayedTasks = computed(() => {
    const t = this.tasks();
    const s = this.sortBy();
    const fs = this.filterStatus();
    const fc = this.filterCategory();
    return this.applyFilterSort(t, s, fs, fc);
  });

  taskForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    status: [TaskStatus.Todo],
    category: [TaskCategory.Work],
  });

  constructor(
    private auth: AuthService,
    private router: Router,
    private taskService: TaskService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    const user = this.auth.currentUser;
    this.currentEmail = user?.email ?? 'Signed in';
  }

  get canManageTasks(): boolean {
    const role = this.auth.currentUser?.role;
    return role === Role.Admin || role === Role.Owner;
  }

  get canViewAudit(): boolean {
    return this.auth.canViewAudit;
  }

  canReorder(): boolean {
    return this.canManageTasks && this.sortBy() === 'default' && !this.filterStatus() && !this.filterCategory();
  }

  private applyFilterSort(tasks: Task[], sortBy: string, filterStatus: string, filterCategory: string): Task[] {
    let out = tasks.slice();
    if (filterStatus) out = out.filter((t) => t.status === filterStatus);
    if (filterCategory) out = out.filter((t) => t.category === filterCategory);
    switch (sortBy) {
      case 'dateDesc':
        out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'dateAsc':
        out.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'status':
        out.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case 'titleAsc':
        out.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'titleDesc':
        out.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        out.sort((a, b) => a.order - b.order || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return out;
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    if (!this.canReorder()) return;
    const list = this.displayedTasks().slice();
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    list.forEach((task, i) => (task.order = i));
    this.tasks.set([...list]);
    const update$ = list.map((task, i) => this.taskService.updateTask(task.id, { order: i }));
    forkJoin(update$).subscribe({
      next: () => {
        // Keep current list; no refetch so CDK state and Edit/Delete on all panels stay valid
      },
      error: (err) => (this.error = err?.error?.message ?? 'Failed to reorder'),
    });
  }

  /** Run after any drag ends so the view and pointer-events are refreshed and Edit/Delete work again. */
  onDragEnd(): void {
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  updateTaskStatus(task: Task, status: string): void {
    if (status === task.status || !Object.values(TaskStatus).includes(status as TaskStatus)) return;
    this.taskService.updateTask(task.id, { status: status as TaskStatus }).subscribe({
      next: (updated) => {
        task.status = updated.status;
        task.updatedAt = updated.updatedAt;
        this.tasks.set([...this.tasks()]);
      },
      error: (err) => (this.error = err?.error?.message ?? 'Failed to update status'),
    });
  }

  ngOnInit(): void {
    this.taskService.loadTasks().subscribe({
      next: (list) => {
        this.tasks.set(list);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load tasks';
        this.loading = false;
      },
    });
  }

  openCreate(): void {
    this.editingTask = null;
    this.taskForm.reset({ title: '', description: '', status: TaskStatus.Todo, category: TaskCategory.Work });
    this.showModal = true;
  }

  openEdit(task: Task): void {
    this.editingTask = task;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      category: task.category,
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingTask = null;
  }

  saveTask(): void {
    if (this.taskForm.invalid) return;
    this.saving = true;
    const value = this.taskForm.getRawValue();
    const dto: CreateTaskDto = {
      title: value.title,
      description: value.description || undefined,
      status: value.status,
      category: value.category,
    };
    if (this.editingTask) {
      this.taskService.updateTask(this.editingTask.id, dto).subscribe({
        next: (updated) => {
          // Update the edited task in place so we keep the same object references for other tasks (e.g. one that was just dragged) and don't break CDK drag state
          const current = this.tasks();
          const idx = current.findIndex((t) => t.id === updated.id);
          if (idx !== -1) {
            const t = current[idx];
            t.title = updated.title;
            t.description = updated.description ?? '';
            t.status = updated.status;
            t.category = updated.category;
            t.updatedAt = updated.updatedAt;
            if (updated.order !== undefined) t.order = updated.order;
          }
          this.tasks.set([...current]);
          this.saving = false;
          this.closeModal();
        },
        error: (err) => {
          this.error = err?.error?.message ?? 'Update failed';
          this.saving = false;
        },
      });
    } else {
      this.taskService.createTask(dto).subscribe({
        next: (newTask) => {
          this.tasks.set([...this.tasks(), newTask]);
          this.saving = false;
          this.closeModal();
        },
        error: (err) => {
          this.error = err?.error?.message ?? 'Create failed';
          this.saving = false;
        },
      });
    }
  }

  confirmDelete(task: Task): void {
    if (!confirm(`Delete "${task.title}"?`)) return;
    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.tasks.set(this.tasks().filter((t) => t.id !== task.id));
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Delete failed';
      },
    });
  }

  formatStatus(s: TaskStatus): string {
    const map: Record<string, string> = {
      [TaskStatus.Todo]: 'To do',
      [TaskStatus.InProgress]: 'In progress',
      [TaskStatus.Done]: 'Done',
    };
    return map[s] ?? s;
  }

  formatCategory(c: TaskCategory): string {
    const map: Record<string, string> = {
      [TaskCategory.Work]: 'Work',
      [TaskCategory.Personal]: 'Personal',
    };
    return map[c] ?? c;
  }

  statusClass(s: TaskStatus): string {
    const base = 'rounded px-2 py-0.5 text-xs font-medium ';
    switch (s) {
      case TaskStatus.Done:
        return base + 'bg-emerald-500/20 text-emerald-400';
      case TaskStatus.InProgress:
        return base + 'bg-amber-500/20 text-amber-400';
      default:
        return base + 'bg-slate-500/20 text-slate-400';
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
