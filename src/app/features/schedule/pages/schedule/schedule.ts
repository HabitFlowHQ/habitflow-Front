import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule }               from '@angular/common';
import { RouterLink }                 from '@angular/router';
import { ScheduleService }            from '../../../../core/services/schedule.service';
import { HabitService }               from '../../../../core/services/habit.service';
import { TaskService }                from '../../../../core/services/task.service';
import { ScheduleResponse, ScheduleHabit, ScheduleTask } from '../../../../shared/models/schedule.model';

@Component({
  selector:    'app-schedule',
  standalone:  true,
  imports:     [CommonModule, RouterLink],
  templateUrl: './schedule.html',
  styleUrl:    './schedule.scss',
})
export class Schedule implements OnInit {

  private scheduleService = inject(ScheduleService);
  private habitService    = inject(HabitService);
  private taskService     = inject(TaskService);
  private cdr             = inject(ChangeDetectorRef);

  schedule:    ScheduleResponse | null = null;
  isLoading                            = false;
  errorMessage                         = '';
  currentDate                          = new Date();

  // ── Getters ──────────────────────────────────
  get formattedDate(): string {
    return this.currentDate.toISOString().split('T')[0]; // "2026-05-30"
  }

  get displayDate(): string {
    return this.currentDate.toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  get isToday(): boolean {
    const today = new Date();
    return this.currentDate.toDateString() === today.toDateString();
  }

  get habitsProgress(): number {
    if (!this.schedule || this.schedule.totalHabits === 0) return 0;
    return Math.round((this.schedule.completedHabits / this.schedule.totalHabits) * 100);
  }

  get tasksProgress(): number {
    if (!this.schedule || this.schedule.totalTasks === 0) return 0;
    return Math.round((this.schedule.completedTasks / this.schedule.totalTasks) * 100);
  }

  // ── Lifecycle ────────────────────────────────
  ngOnInit(): void {
    this.loadSchedule();
  }

  loadSchedule(): void {
    this.isLoading    = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.scheduleService.getSchedule(this.formattedDate).subscribe({
      next:  (data) => {
        this.schedule = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: ()     => {
        this.errorMessage = 'Failed to load schedule.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Navigation ───────────────────────────────
  prevDay(): void {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() - 1);
    this.currentDate = d;
    this.loadSchedule();
  }

  nextDay(): void {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() + 1);
    this.currentDate = d;
    this.loadSchedule();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.loadSchedule();
  }

  // ── Actions ──────────────────────────────────
  completeHabit(habit: ScheduleHabit): void {
    if (habit.isCompleted) return;

    this.habitService.completeHabit(habit.id).subscribe({
      next: () => {
        habit.isCompleted    = true;
        habit.completedCount = habit.targetCount;
        if (this.schedule) this.schedule.completedHabits++;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to complete habit.';
        this.cdr.detectChanges();
      }
    });
  }

  // ── Helpers ──────────────────────────────────
  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      'Low': 'priority-low', 'Medium': 'priority-medium', 'High': 'priority-high'
    };
    return map[priority] ?? '';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'status-pending', 'InProgress': 'status-inprogress', 'Completed': 'status-done'
    };
    return map[status] ?? '';
  }

  formatMinutes(min: number): string {
    if (!min) return '';
    return min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min}m`;
  }
}
