import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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

  ngOnInit(): void {
    this.fullName = localStorage.getItem('userName') || '';
    this.email = localStorage.getItem('email') || '';
  }

  // Profile change handlers
  onAvatarUpload(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarUrl = e.target.result;
        this.toastr.success('Avatar uploaded successfully!', 'Profile Settings');
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

    localStorage.setItem('userName', this.fullName);
    localStorage.setItem('email', this.email);
    this.toastr.success('Profile settings updated successfully!', 'Success');
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

    // Reset password fields
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.toastr.success('Password updated successfully!', 'Security Updated');
  }

  // Cancel action
  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
