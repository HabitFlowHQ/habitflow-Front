
import { Component }   from '@angular/core';
import { CommonModule }from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService }  from '../../../../core/services/auth.service';
import { RegisterDto }  from '../../../../shared/models/auth.model';

@Component({
  selector:    'app-register',
  standalone:  true,
  imports:     [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {

  formData: RegisterDto = {
    userName: '',
    email:    '',
    password: ''
  };

  confirmPassword: string = '';

  isLoading:    boolean = false;
  errorMessage: string  = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router:      Router
  ) {}

  onSubmit(): void {

    if (!this.formData.userName.trim() ||
        !this.formData.email.trim()    ||
        !this.formData.password.trim()) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.formData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.formData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    this.authService.register(this.formData).subscribe({

      next: () => {

        this.router.navigate(['/login']);
      },

      error: (err) => {
        if (err.status === 400) {
          this.errorMessage = err.error?.message || 'Email or username already exists';
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }
        this.isLoading = false;
      }

    });
  }
}
