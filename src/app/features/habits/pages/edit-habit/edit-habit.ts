import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HabitService } from '../../../../core/services/habit.service';
import { UpdateHabitDto } from '../../../../shared/models/habit.model';

@Component({
  selector: 'app-edit-habit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-habit.html',
  styleUrl: './edit-habit.scss',
})
export class EditHabit implements OnInit {

  habitId!: number;

  dto: UpdateHabitDto = {
    title: '',
    description: '',
    category: '',
    frequencyType: 'Daily',
    targetCount: 1,
    color: '',
    icon: ''
  };

  isLoading    = false;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private habitService: HabitService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.errorMessage = 'Habit ID not found in URL';
      return;
    }
    this.habitId = +idParam;
    this.loadHabit();
  }

  loadHabit(): void {
    this.isLoading = true;
    this.habitService.getHabitById(this.habitId).subscribe({
      next: (habit) => {
        this.dto = {
          title:         habit.title,
          description:   habit.description,
          category:      habit.category,
          frequencyType: habit.frequencyType,
          targetCount:   habit.targetCount,
          color:         habit.color,
          icon:          habit.icon
        };
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load habit for editing.';
        this.isLoading    = false;
        console.error(err);
      }
    });
  }

  submit(): void {
    if (!this.dto.title.trim() || !this.dto.category.trim()) {
      this.errorMessage = 'Title and Category are required.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.habitService.updateHabit(this.habitId, this.dto).subscribe({
      next: () => this.router.navigate(['/habits', this.habitId]),
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to update habit.';
        this.isSubmitting = false;
      }
    });
  }
}
