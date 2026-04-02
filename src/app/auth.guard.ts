import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from './services/auth.service';

export const authGuard: CanActivateFn = (route): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const allowedRoles = route.data?.['roles'] as string[] | undefined;
  const rawRole = auth.getRole();
  const role = rawRole?.trim().toLowerCase();

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const normalizedAllowedRoles = allowedRoles.map(r => r.trim().toLowerCase());

  if (role && normalizedAllowedRoles.includes(role)) {
    return true;
  }

  if (role === 'manager') {
    return router.createUrlTree(['/houses']);
  }

  if (role === 'resident') {
    return router.createUrlTree(['/resident/dashboard']);
  }

  return router.createUrlTree(['/login']);
};