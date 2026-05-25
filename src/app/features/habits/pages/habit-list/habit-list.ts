import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitCard } from '../../components/habit-card/habit-card';
import { Habit } from '../../../../shared/models/habit.model';
import { HabitService } from '../../../../core/services/habit.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-habit-list',
  standalone: true,
  imports: [HabitCard, CommonModule],
  templateUrl: './habit-list.html',
  styleUrl: './habit-list.scss',
})
export class HabitList implements OnInit, OnDestroy {

  habits: Habit[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  private habitsSubscription?: Subscription;

  constructor(private habitService: HabitService) {}

  ngOnInit(): void {
    this.loadHabits();
  }

  ngOnDestroy(): void {
    this.habitsSubscription?.unsubscribe();
  }

  loadHabits(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.habitsSubscription = this.habitService.getHabits().subscribe({
      next: (data: Habit[]) => {
        this.habits = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching habits:', error);
        this.errorMessage = 'Failed to load habits.';
        this.isLoading = false;
      }
    });
  }

  completeHabit(id: number): void {
    this.habitService.completeHabit(id).subscribe({
      next: (message: string) => {
        console.log(message);
        this.loadHabits();
      },
      error: (error: any) => {
        console.error('Error completing habit:', error);
        this.errorMessage = 'Failed to complete habit.';
      }
    });
  }

  deleteHabit(id: number): void {
    if (!confirm('Are you sure you want to delete this habit?')) return;

    this.habitService.deleteHabit(id).subscribe({
      next: () => {
        this.habits = this.habits.filter(habit => habit.id !== id);
      },
      error: (error: any) => {
        console.error('Error deleting habit:', error);
        this.errorMessage = 'Failed to delete habit.';
      }
    });
  }
}
