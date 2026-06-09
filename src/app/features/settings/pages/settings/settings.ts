import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class SettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);

  // Profile Information
  fullName = '';
  email = '';
  avatarUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3XTyKglkBZtcwb-qUMbpv3HgwOwFbFbE5ICYj94uos6zbDgRCQYJXcXa2EPwEF7Pvchts_mCPkT_YXBoCjbVfzchtvIXGmZtdgv0VjfAlU7nXBlynvVfyG4ZuC2KIpqB47TZ_aDqBw1jxHHXEZfMI_zbT0dx1Wks2bnh_ynoAyQjOiHqFVNC-NoSK1tYgG7i4o5iHxAXutTinGG6xleDqqy1CBWcrKscskIElgumaT-yhDYr2REr80aNoKphScOyxLR8-6fhY7ro';

  // Security
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // Password Visibility toggles
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  isLoading = false;

  ngOnInit(): void {
    this.isLoading = true;
    this.http.get<any>('http://localhost:5066/api/Auth/profile')
      .subscribe({
        next: (res) => {
          this.fullName = res.userName || '';
          this.email = res.email || '';
          if (res.profilePictureUrl) {
            this.avatarUrl = res.profilePictureUrl;
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          // Fallback to local storage
          this.fullName = localStorage.getItem('userName') || '';
          this.email = localStorage.getItem('email') || '';
          this.cdr.detectChanges();
        }
      });
  }

  // Profile change handlers
  onAvatarUpload(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.toastr.error('Avatar image size cannot exceed 2MB.', 'Validation Error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarUrl = e.target.result;
        this.toastr.success('Avatar uploaded successfully! Click "Save Changes" to apply.', 'Profile Settings');
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  onSaveProfile(): void {
    if (!this.fullName.trim()) {
      this.toastr.error('Full Name cannot be empty.', 'Validation Error');
      return;
    }

    if (!this.email.trim() || !this.email.includes('@')) {
      this.toastr.error('Please enter a valid email address.', 'Validation Error');
      return;
    }

    const body = {
      userName: this.fullName.trim(),
      email: this.email.trim(),
      profilePictureUrl: this.avatarUrl,
      bio: ''
    };

    this.isLoading = true;
    this.http.put<any>('http://localhost:5066/api/Auth/update-profile', body)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          localStorage.setItem('userName', this.fullName);
          localStorage.setItem('email', this.email);
          this.toastr.success('Profile settings updated successfully!', 'Success');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          const errorMsg = err.error?.message || 'Failed to update profile settings.';
          this.toastr.error(errorMsg, 'Error');
          this.cdr.detectChanges();
        }
      });
  }

  // Password saving
  onSavePassword(): void {
    if (!this.currentPassword) {
      this.toastr.error('Current password is required.', 'Validation Error');
      return;
    }

    if (!this.newPassword || this.newPassword.length < 6) {
      this.toastr.error('New password must be at least 6 characters.', 'Validation Error');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('New password and confirm password do not match.', 'Validation Error');
      return;
    }

    const body = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    };

    this.isLoading = true;
    this.http.put<any>('http://localhost:5066/api/Auth/update-password', body)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
          this.toastr.success('Password updated successfully!', 'Security Updated');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          const errorMsg = err.error?.message || 'Failed to update password. Verify current password.';
          this.toastr.error(errorMsg, 'Error');
          this.cdr.detectChanges();
        }
      });
  }

  // Cancel action
  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
