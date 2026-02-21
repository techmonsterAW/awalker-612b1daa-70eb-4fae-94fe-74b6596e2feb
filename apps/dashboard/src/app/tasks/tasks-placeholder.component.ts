import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TaskService } from './task.service';
import { Task, TaskStatus, TaskCategory, Role, CreateTaskDto } from '@taskmgmt/data';

@Component({
  selector: 'app-tasks-placeholder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="relative z-10 flex min-h-screen flex-col">
      <header class="flex items-center justify-between border-b border-white/10 bg-base-elevated px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-lg bg-gradient-to-br from-accent to-emerald-500 shadow-lg shadow-emerald-500/30"></div>
          <span class="text-lg font-bold tracking-tight text-slate-100">Task Management</span>
        </div>
        <div class="flex items-center gap-4">
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
      <main class="flex-1 p-6">
        <div class="mx-auto max-w-3xl">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-bold tracking-tight text-slate-100">Tasks</h2>
            @if (canManageTasks) {
              <button
                type="button"
                class="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-90"
                (click)="openCreate()"
              >
                Add task
              </button>
            }
          </div>

          @if (loading) {
            <div class="flex items-center justify-center py-12">
              <span class="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent"></span>
            </div>
          } @else if (error) {
            <div class="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {{ error }}
            </div>
          } @else if (tasks.length === 0) {
            <p class="rounded-xl border border-white/10 bg-base-card p-6 text-center text-slate-400">
              No tasks yet. Tasks you create will appear here.
            </p>
          } @else {
            <ul class="space-y-3">
              @for (task of tasks; track task.id) {
                <li class="rounded-xl border border-white/10 bg-base-card p-4 transition hover:border-white/15">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0 flex-1">
                      <h3 class="font-semibold text-slate-100">{{ task.title }}</h3>
                      @if (task.description) {
                        <p class="mt-1 text-sm text-slate-400 line-clamp-2">{{ task.description }}</p>
                      }
                      <div class="mt-2 flex flex-wrap items-center gap-2">
                        <span [class]="statusClass(task.status)">{{ formatStatus(task.status) }}</span>
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
        <div class="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4" (click)="closeModal()">
          <div class="w-full max-w-md rounded-2xl border border-white/10 bg-base-card p-6 shadow-xl" (click)="$event.stopPropagation()">
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
  tasks: Task[] = [];
  loading = true;
  error = '';
  currentEmail = '';
  showModal = false;
  editingTask: Task | null = null;
  saving = false;
  TaskStatus = TaskStatus;
  TaskCategory = TaskCategory;

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
    private fb: FormBuilder
  ) {
    const user = this.auth.currentUser;
    this.currentEmail = user?.email ?? 'Signed in';
  }

  get canManageTasks(): boolean {
    const role = this.auth.currentUser?.role;
    return role === Role.Admin || role === Role.Owner;
  }

  ngOnInit(): void {
    this.taskService.loadTasks().subscribe({
      next: (list) => {
        this.tasks = list;
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
        next: () => {
          this.tasks = this.taskService.getTasks();
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
        next: () => {
          this.tasks = this.taskService.getTasks();
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
        this.tasks = this.taskService.getTasks();
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
