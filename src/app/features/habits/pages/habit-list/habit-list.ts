import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit } from '../../../../shared/models/habit.model';
import { HabitService } from '../../../../core/services/habit.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-habit-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './habit-list.html',
  styleUrl: './habit-list.scss',
})
export class HabitList implements OnInit, OnDestroy {

  habits: Habit[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  searchQuery: string = '';

  get filteredHabits(): Habit[] {
    if (!this.searchQuery.trim()) {
      return this.habits;
    }
    const q = this.searchQuery.toLowerCase();
    return this.habits.filter(h => 
      h.title.toLowerCase().includes(q) || 
      (h.description && h.description.toLowerCase().includes(q)) ||
      h.category.toLowerCase().includes(q)
    );
  }

  private habitsSubscription?: Subscription;

  constructor(
    private habitService: HabitService,
    private cdr: ChangeDetectorRef
  ) {}

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
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error fetching habits:', error);
        this.errorMessage = 'Failed to load habits.';
        this.isLoading = false;
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      }
    });
  }

  deleteHabit(id: number): void {
    if (!confirm('Are you sure you want to delete this habit?')) return;

    this.habitService.deleteHabit(id).subscribe({
      next: () => {
        this.habits = this.habits.filter(habit => habit.id !== id);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error deleting habit:', error);
        this.errorMessage = 'Failed to delete habit.';
        this.cdr.detectChanges();
      }
    });
  }
}
