import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

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
      <main class="flex flex-1 items-center justify-center p-6">
        <div class="max-w-[420px] rounded-2xl border border-white/10 bg-base-card p-8 text-center shadow-xl">
          <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-accent-dim text-accent">
            <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <h2 class="mb-3 text-2xl font-bold tracking-tight text-slate-100">You're all set</h2>
          <p class="mb-6 text-slate-400 leading-relaxed">
            You're signed in. The task list and full workspace will be available in the next step.
          </p>
          <div class="inline-flex items-center gap-2 rounded-full bg-accent-dim px-4 py-2 text-sm font-medium text-accent">
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-accent"></span>
            Ready for tasks
          </div>
        </div>
      </main>
    </div>
  `,
})
export class TasksPlaceholderComponent {
  currentEmail = '';

  constructor(private auth: AuthService, private router: Router) {
    const user = this.auth.currentUser;
    this.currentEmail = user?.email ?? 'Signed in';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
