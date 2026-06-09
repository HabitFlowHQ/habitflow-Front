import { Injectable }    from '@angular/core';
import { HttpClient }    from '@angular/common/http';
import { Router }        from '@angular/router';
import { Observable }    from 'rxjs';
import { tap }           from 'rxjs/operators';
import { LoginDto, RegisterDto, AuthResponse } from '../../shared/models/auth.model';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:5066/api/auth';

  constructor(
    private http:   HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}


  register(dto: RegisterDto): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, dto)
    .pipe(
      tap( //tap : allows us to perform side effects (like storing tokens) without altering the response stream
        (response: AuthResponse) => {
        if (response.token) {
          localStorage.setItem('token',    response.token);
          localStorage.setItem('userName', response.userName);
          localStorage.setItem('email',    response.email);
          localStorage.setItem('isPremium', String(response.isPremium ?? false));
        }
      })
    );
  }


  login(dto: LoginDto): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, dto)
    .pipe(
      tap(//tap : allows us to perform side effects (like storing tokens) without altering the response stream
        (response: AuthResponse) => {
        if (response.token) {
          localStorage.setItem('token',    response.token);
          localStorage.setItem('userName', response.userName);
          localStorage.setItem('email',    response.email);
          localStorage.setItem('isPremium', String(response.isPremium ?? false));
        }
      })
    );
  }


  logout(): void {
    // Clear all auth-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('email');
    localStorage.removeItem('isPremium');
    this.toastr.success('You have been logged out successfully', 'Success');
    this.router.navigate(['/login']);
  }


  isLoggedIn(): boolean {
    return !! localStorage.getItem('token');
    //!!: converts the value to a boolean. If token exists, it returns true
  }


  isPremium(): boolean {
    return localStorage.getItem('isPremium') === 'true';
  }


  getUserName(): string {
    return localStorage.getItem('userName') ?? 'User';
  }


  getToken(): string | null {
    return localStorage.getItem('token');
  }


}

