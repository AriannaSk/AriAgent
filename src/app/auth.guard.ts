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

  const expectedRoles = route.data?.['roles'] as string[] | undefined;

  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  const userRole = auth.getRole();

  if (!userRole || !expectedRoles.includes(userRole)) {
    if (auth.isResident()) {
      router.navigate(['/resident/dashboard']);
    } else if (auth.isManager()) {
      router.navigate(['/houses']);
    } else {
      router.navigate(['/login']);
    }

    return false;
  }

  return true;
};