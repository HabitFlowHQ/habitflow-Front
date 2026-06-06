import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HabitService } from '../../../../core/services/habit.service';
import { CreateHabitDto } from '../../../../shared/models/habit.model';

@Component({
  selector: 'app-create-habit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-habit.html',
  styleUrl: './create-habit.scss',
})

export class CreateHabit implements OnInit {

  dto: CreateHabitDto = {
    title: '',
    description: '',
    category: '',
    color: '#a4e6ff',
    icon: '📁',
    endDate: '',
    createdAt: ''
  };

  isSubmitting = false;
  errorMessage = '';

  readonly iconOptions = [
    '📁', '🗂', '💻', '🎨', '✍️', '🏠', '🏋️', '🎵', '✈️', '🎓', '💼', '🚀', '🌟'
  ];

  constructor(
    private habitService: HabitService,
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef // To trigger change detection after async operations
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.dto.createdAt = today.toLocaleDateString('en-CA'); // YYYY-MM-DD
    //toLocaleDateString to tra
  }

  submit(): void {
    if (!this.dto.title.trim() || !this.dto.category.trim()) {
      //trim() to prevent spaces only input
      this.errorMessage = 'Title and Category are required.';
      this.toastr.warning(this.errorMessage, 'Warning');
      this.cdr.detectChanges(); //update view with error message
      return;
    }

    if (!this.dto.endDate) {
      this.errorMessage = 'End date is required.';
      this.toastr.warning(this.errorMessage, 'Warning');
      this.cdr.detectChanges();
      return;
    }

    if (this.dto.createdAt) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);//delete time part for accurate date comparison
      const start = new Date(this.dto.createdAt);
      start.setHours(0, 0, 0, 0);
      if (start.getTime() < today.getTime()) {
        this.errorMessage = 'Start date cannot be in the past.';
        this.toastr.error(this.errorMessage, 'Error');
        this.cdr.detectChanges();
        return;
      }
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.habitService.createHabit(this.dto).subscribe({
      next: () => {
        this.toastr.success('Habit created successfully!', 'Success');
        this.router.navigate(['/habits']);
      },

      // Handle errors from api
      error: (err) => {
        console.error(err);
        const errorMsg = err.error || 'Failed to create habit.';
        this.errorMessage = typeof errorMsg === 'string' ? errorMsg : (errorMsg.message || 'Failed to create habit.');
        this.toastr.error(this.errorMessage, 'Error');
        this.isSubmitting = false;
        this.cdr.detectChanges();

        if (this.errorMessage.includes('Upgrade to Premium'))
          {
          this.router.navigate(['/checkout']);
        }

      }
    });
  }
}
