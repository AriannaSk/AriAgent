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
  const role = auth.getRole();

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (role && allowedRoles.includes(role)) {
    return true;
  }

  if (role === 'Manager') {
    router.navigate(['/houses']);
    return false;
  }

  if (role === 'Resident') {
    router.navigate(['/resident/dashboard']);
    return false;
  }

  router.navigate(['/login']);
  return false;
};