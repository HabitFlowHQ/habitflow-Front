import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HabitService } from '../../../../core/services/habit.service';
import { CreateHabitDto } from '../../../../shared/models/habit.model';

@Component({
  selector: 'app-create-habit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-habit.html',
  styleUrl: './create-habit.scss',
})
export class CreateHabit {

  dto: CreateHabitDto = {
    title: '',
    description: '',
    category: '',
    frequencyType: 0,
    targetCount: 1,
    color: '',
    icon: ''
  };

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private habitService: HabitService,
    private router: Router
  ) {}

  submit(): void {
    if (!this.dto.title.trim() || !this.dto.category.trim()) {
      this.errorMessage = 'Title and Category are required.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.habitService.createHabit(this.dto).subscribe({
      next: () => this.router.navigate(['/habits']),
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to create habit.';
        this.isSubmitting = false;
      }
    });
  }
}
