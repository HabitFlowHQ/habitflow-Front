import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HabitService } from '../../../../core/services/habit.service';
import { Habit } from '../../../../shared/models/habit.model';

@Component({
  selector: 'app-habit-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './habit-detail.html',
  styleUrl: './habit-detail.scss',
})
export class HabitDetail implements OnInit {

  habit: Habit | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private habitService: HabitService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('[HabitDetail] Component OnInit initialized');
    this.route.paramMap.subscribe({
      next: (params) => {
        const idParam = params.get('id');
        console.log('[HabitDetail] Route parameter "id" changed:', idParam);
        if (!idParam) {
          this.errorMessage = 'Habit ID not found in URL';
          return;
        }
        const id = +idParam;
        if (isNaN(id)) {
          this.errorMessage = 'Invalid Habit ID provided';
          return;
        }
        this.loadHabit(id);
      },
      error: (err) => {
        console.error('[HabitDetail] Error reading route params:', err);
        this.errorMessage = 'Failed to parse route parameters';
      }
    });
  }

  loadHabit(id: number): void {
    console.log(`[HabitDetail] Sending API request to load habit ID: ${id}`);
    this.isLoading = true;
    this.errorMessage = '';
    this.habit = null;

    this.habitService.getHabitById(id).subscribe({
      next: (data) => {
        console.log('[HabitDetail] Successfully loaded habit details:', data);
        this.habit     = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[HabitDetail] API error occurred:', err);
        this.errorMessage = err.status === 404 
          ? 'Habit not found' 
          : 'Failed to load habit (' + (err.message || 'connection error') + ')';
        this.isLoading    = false;
      }
    });
  }

  deleteHabit(): void {
    if (!this.habit) return;
    if (!confirm('Are you sure you want to delete this habit?')) return;
    this.habitService.deleteHabit(this.habit.id).subscribe({
      next: () => this.router.navigate(['/habits']),
      error: (err) => console.error(err)
    });
  }

  completeHabit(): void {
    if (!this.habit) return;
    this.habitService.completeHabit(this.habit.id).subscribe({
      next: (msg) => {
        console.log(msg);
        this.loadHabit(this.habit!.id);
      },
      error: (err) => console.error(err)
    });
  }
}
