
import { Component }   from '@angular/core';
import { CommonModule }from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { LoginDto }    from '../../../../shared/models/auth.model';

@Component({
  selector:    'app-login',
  standalone:  true,
  imports:     [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {

  formData: LoginDto = {
    usernameOrEmail: '', //username or email can be used to login
    password: ''
  };

  isLoading:    boolean = false;
  errorMessage: string  = '';

  constructor(
    private authService: AuthService,
    private router:      Router
  ) {}

  onSubmit(): void {
     // Basic client-side validation
    if (!this.formData.usernameOrEmail.trim() || !this.formData.password.trim()) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    this.authService.login(this.formData).subscribe({//call service to login user

      next: () => {
        this.router.navigate(['/dashboard']);
      },

      error: (err) => {
        if (err.status === 401) {
          this.errorMessage = 'Invalid username/email or password';
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }
        this.isLoading = false; // activate the login button again
      }

    });
  }
}
