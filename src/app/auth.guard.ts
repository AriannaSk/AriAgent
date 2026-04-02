import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
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
    router.navigate(['/houses']);
    return false;
  }

  if (role === 'resident') {
    router.navigate(['/resident/dashboard']);
    return false;
  }

  router.navigate(['/login']);
  return false;
};