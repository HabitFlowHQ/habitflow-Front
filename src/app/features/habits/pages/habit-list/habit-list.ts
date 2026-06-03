import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit } from '../../../../shared/models/habit.model';
import { HabitService } from '../../../../core/services/habit.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const list = this.habits.filter(h => {
      if (!h.createdAt) return true;
      
      const start = new Date(h.createdAt);
      start.setHours(0, 0, 0, 0);

      const end = h.endDate ? new Date(h.endDate) : null;
      if (end) {
        end.setHours(0, 0, 0, 0);
      }

      const started = start.getTime() <= today.getTime();
      const notEnded = !end || end.getTime() >= today.getTime();

      return started && notEnded;
    });

    if (!this.searchQuery.trim()) {
      return list;
    }
    const q = this.searchQuery.toLowerCase();
    return list.filter(h =>
      h.title.toLowerCase().includes(q) ||
      (h.description && h.description.toLowerCase().includes(q)) ||
      h.category.toLowerCase().includes(q)
    );
  }

  private habitsSubscription?: Subscription;

  constructor(
    private habitService: HabitService,
    private toastr: ToastrService,
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
        this.toastr.error(this.errorMessage, 'Error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  completeHabit(id: number): void {
    this.habitService.completeHabit(id).subscribe({
      next: (message: string) => {
        console.log(message);
        this.toastr.success('Habit completed! +10 XP', 'Success');
        this.loadHabits();
      },
      error: (error: any) => {
        console.error('Error completing habit:', error);
        const errMsg = error.error || 'Failed to complete habit.';
        this.toastr.warning(errMsg, 'Warning');
        this.cdr.detectChanges();
      }
    });
  }

  deleteHabit(id: number): void {
    this.habitService.deleteHabit(id).subscribe({
      next: () => {
        this.toastr.success('Habit deleted successfully', 'Success');
        this.habits = this.habits.filter(habit => habit.id !== id);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error deleting habit:', error);
        this.errorMessage = 'Failed to delete habit.';
        this.toastr.error(this.errorMessage, 'Error');
        this.cdr.detectChanges();
      }
    });
  }
}
