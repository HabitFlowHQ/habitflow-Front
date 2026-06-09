import { inject }        from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router }        from '@angular/router';
import { AuthService }   from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient }    from '@angular/common/http';
import { of }            from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const premiumGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router      = inject(Router);
  const toastr      = inject(ToastrService);
  const http        = inject(HttpClient);

  // Call the profile endpoint to verify current database premium status in real time
  return http.get<any>('http://localhost:5066/api/Auth/profile').pipe(
    map(res => {
      const isPremium = !!res.isPremium;
      // Update local storage so that other client-side checks remain in sync
      localStorage.setItem('isPremium', isPremium ? 'true' : 'false');
      
      if (isPremium) {
        return true;
      }
      
      toastr.warning('Upgrade to Premium to unlock this feature.', 'Premium Required');
      router.navigate(['/checkout'], { queryParams: { returnUrl: state.url } });
      return false;
    }),
    catchError(() => {
      // Fallback to local storage if API call fails
      if (authService.isPremium()) {
        return of(true);
      }
      toastr.warning('Upgrade to Premium to unlock this feature.', 'Premium Required');
      router.navigate(['/checkout'], { queryParams: { returnUrl: state.url } });
      return of(false);
    })
  );
};
