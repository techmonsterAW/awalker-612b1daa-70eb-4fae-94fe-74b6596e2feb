import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div class="w-full max-w-[400px] rounded-2xl border border-white/10 bg-base-card p-8 shadow-xl shadow-glow">
        <div class="mb-8 text-center">
          <div class="mx-auto mb-5 h-12 w-12 rounded-xl bg-gradient-to-br from-accent to-emerald-500 shadow-lg shadow-emerald-500/35"></div>
          <h1 class="mb-2 text-2xl font-bold tracking-tight text-slate-100">Welcome back</h1>
          <p class="text-[0.9375rem] font-medium text-slate-400">Sign in to your task workspace</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
          <div class="flex flex-col gap-2">
            <label for="email" class="text-sm font-semibold text-slate-400">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="you@example.com"
              autocomplete="email"
              class="w-full rounded-xl border border-white/10 bg-base-input px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 hover:border-white/20"
            />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <span class="text-[0.8125rem] text-red-400">Please enter a valid email</span>
            }
          </div>
          <div class="flex flex-col gap-2">
            <label for="password" class="text-sm font-semibold text-slate-400">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              autocomplete="current-password"
              class="w-full rounded-xl border border-white/10 bg-base-input px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 hover:border-white/20"
            />
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="text-[0.8125rem] text-red-400">Password is required</span>
            }
          </div>
          @if (error) {
            <div class="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {{ error }}
            </div>
          }
          <button
            type="submit"
            [disabled]="form.invalid || loading"
            class="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-accent to-emerald-500 px-6 py-3.5 font-semibold text-slate-900 transition hover:shadow-glow-md disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-0 hover:not(:disabled):-translate-y-px hover:not(:disabled):shadow-glow-md"
          >
            @if (loading) {
              <span class="h-[18px] w-[18px] animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900"></span>
              Signing in…
            } @else {
              Sign in
            }
          </button>
        </form>
      </div>
      <p class="mt-8 text-[0.8125rem] text-slate-500">Secure Task Management</p>
    </div>
  `,
})
export class LoginComponent {
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error = '';
    this.loading = true;
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/tasks']),
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.message || 'Login failed';
      },
      complete: () => (this.loading = false),
    });
  }
}
