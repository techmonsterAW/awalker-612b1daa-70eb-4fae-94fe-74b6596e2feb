import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { AuditService } from './audit.service';
import { AuditLogEntry } from '@taskmgmt/data';

@Component({
  selector: 'app-audit-placeholder',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="relative z-10 flex min-h-screen flex-col">
      <header class="flex items-center justify-between border-b border-white/10 bg-base-elevated px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-lg bg-gradient-to-br from-accent to-emerald-500 shadow-lg shadow-emerald-500/30"></div>
          <span class="text-lg font-bold tracking-tight text-slate-100">Task Management</span>
          <nav class="ml-6 flex items-center gap-2">
            <a
              routerLink="/tasks"
              class="rounded-lg px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
            >
              Tasks
            </a>
            <a
              routerLink="/audit"
              class="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-slate-100"
            >
              Audit log
            </a>
          </nav>
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
        <div class="mx-auto max-w-5xl">
          <h2 class="mb-4 text-xl font-bold tracking-tight text-slate-100">Audit log</h2>
          @if (loading) {
            <div class="flex justify-center py-12">
              <span class="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent"></span>
            </div>
          } @else if (error) {
            <div class="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {{ error }}
            </div>
          } @else if (entries.length === 0) {
            <p class="rounded-xl border border-white/10 bg-base-card p-6 text-center text-slate-400">
              No audit entries yet.
            </p>
          } @else {
            <div class="overflow-hidden rounded-xl border border-white/10 bg-base-card">
              <table class="w-full text-left text-sm">
                <thead class="border-b border-white/10 bg-base-elevated">
                  <tr>
                    <th class="px-4 py-3 font-medium text-slate-400">Time</th>
                    <th class="px-4 py-3 font-medium text-slate-400">User ID</th>
                    <th class="px-4 py-3 font-medium text-slate-400">Action</th>
                    <th class="px-4 py-3 font-medium text-slate-400">Resource</th>
                    <th class="px-4 py-3 font-medium text-slate-400">Details</th>
                  </tr>
                </thead>
                <tbody>
                  @for (e of entries; track e.id) {
                    <tr class="border-b border-white/5 last:border-0">
                      <td class="px-4 py-3 text-slate-300">{{ formatTime(e.timestamp) }}</td>
                      <td class="px-4 py-3 font-mono text-xs text-slate-400">{{ e.userId }}</td>
                      <td class="px-4 py-3 text-slate-300">{{ e.action }}</td>
                      <td class="px-4 py-3 text-slate-300">{{ e.resourceType }}{{ e.resourceId ? ' / ' + e.resourceId : '' }}</td>
                      <td class="max-w-xs truncate px-4 py-3 text-slate-400" [title]="e.details ?? ''">{{ e.details ?? '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </main>
    </div>
  `,
})
export class AuditPlaceholderComponent implements OnInit {
  entries: AuditLogEntry[] = [];
  loading = true;
  error = '';
  currentEmail = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private auditService: AuditService
  ) {
    const user = this.auth.currentUser;
    this.currentEmail = user?.email ?? 'Signed in';
  }

  ngOnInit(): void {
    this.auditService.getAuditLog().subscribe({
      next: (list) => {
        this.entries = list;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load audit log';
        this.loading = false;
      },
    });
  }

  formatTime(ts: string): string {
    if (!ts) return '—';
    try {
      const d = new Date(ts);
      return d.toLocaleString();
    } catch {
      return ts;
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
