import { inject }        from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router }        from '@angular/router';
import { AuthService }   from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const premiumGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);
  const toastr      = inject(ToastrService);

  if (authService.isPremium()) {
    return true;
  }

  toastr.warning('Upgrade to Premium to unlock this feature.', 'Premium Required');
  router.navigate(['/checkout']);
  return false;  
};
