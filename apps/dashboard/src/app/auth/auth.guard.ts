import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.currentUser) return true;
  router.navigate(['/login']);
  return false;
};

/** Redirects to /tasks if user cannot view audit (Viewer). Use after authGuard. */
export const auditGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.canViewAudit) return true;
  router.navigate(['/tasks']);
  return false;
};
