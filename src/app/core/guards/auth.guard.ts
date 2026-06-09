import { inject }        from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router }        from '@angular/router';
import { AuthService }   from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // User is authenticated, allow access to the route
  }

  router.navigate(['/login']);
  return false;// User is not authenticated, redirect to login page and deny access to the route
};
