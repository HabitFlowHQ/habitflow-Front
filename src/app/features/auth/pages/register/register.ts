
import { Component }   from '@angular/core';
import { CommonModule }from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService }  from '../../../../core/services/auth.service';
import { RegisterDto }  from '../../../../shared/models/auth.model';
import { ToastrService } from 'ngx-toastr';

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
    private router:      Router,
    private toastr:      ToastrService
  ) {}

  onSubmit(): void {

    // Basic client-side validation
    if (!this.formData.userName.trim() ||
        !this.formData.email.trim()    ||
        !this.formData.password.trim()) {
      this.errorMessage = 'Please fill in all fields';
      this.toastr.warning(this.errorMessage, 'Validation Error');
      return;
    }


    if (this.formData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.toastr.warning(this.errorMessage, 'Validation Error');
      return;
    }

    if (this.formData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      this.toastr.warning(this.errorMessage, 'Validation Error');
      return;
    }

    this.isLoading    = true; //unactivate the register button to prevent multiple submissions
    this.errorMessage = '';

    this.authService.register(this.formData).subscribe({

      next: () => {
        this.toastr.success('Account created successfully! Please login.', 'Success');
        this.router.navigate(['/login']);
      },

      error: (err) => {
        if (err.status === 400) {
          this.errorMessage = err.error?.message || 'Email or username already exists';
          this.toastr.warning(this.errorMessage, 'Registration Failed');
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
          this.toastr.error(this.errorMessage, 'Error');
        }
        this.isLoading = false;
      }

    });
  }
}
