import { Injectable }    from '@angular/core';
import { HttpClient }    from '@angular/common/http';
import { Router }        from '@angular/router';
import { Observable }    from 'rxjs';
import { tap }           from 'rxjs/operators';
import { LoginDto, RegisterDto, AuthResponse } from '../../shared/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:5066/api/auth';

  constructor(
    private http:   HttpClient,
    private router: Router
  ) {}


  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, dto);
  }


  login(dto: LoginDto): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, dto).pipe(
      tap((response: AuthResponse) => {
        if (response.token) {
          localStorage.setItem('token',    response.token);
          localStorage.setItem('userName', response.userName);
          localStorage.setItem('email',    response.email);
        }
      })
    );
  }


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('email');
    this.router.navigate(['/login']);
  }


  isLoggedIn(): boolean {
    return !! localStorage.getItem('token');
  }


  getUserName(): string {
    return localStorage.getItem('userName') ?? 'User';
  }


  getToken(): string | null {
    return localStorage.getItem('token');
  }

  
}
