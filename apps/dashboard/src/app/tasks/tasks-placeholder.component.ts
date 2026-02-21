import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TaskService } from './task.service';
import { Task, TaskStatus, TaskCategory } from '@taskmgmt/data';

@Component({
  selector: 'app-tasks-placeholder',
  standalone: true,
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
          <h2 class="mb-4 text-xl font-bold tracking-tight text-slate-100">Tasks</h2>

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
                      <div class="mt-2 flex flex-wrap gap-2">
                        <span [class]="statusClass(task.status)">{{ formatStatus(task.status) }}</span>
                        <span class="rounded bg-base-input px-2 py-0.5 text-xs text-slate-400">{{ formatCategory(task.category) }}</span>
                      </div>
                    </div>
                  </div>
                </li>
              }
            </ul>
          }
        </div>
      </main>
    </div>
  `,
})
export class TasksPlaceholderComponent implements OnInit {
  tasks: Task[] = [];
  loading = true;
  error = '';
  currentEmail = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private taskService: TaskService
  ) {
    const user = this.auth.currentUser;
    this.currentEmail = user?.email ?? 'Signed in';
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
