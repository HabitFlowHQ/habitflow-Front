import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService }  from '../../../../core/services/auth.service';
import { XPService }    from '../../../../core/services/xp.service';
import { HabitService } from '../../../../core/services/habit.service';
import { TaskService }  from '../../../../core/services/task.service';

import { DashboardSummary } from '../../../../shared/models/xp.model';
import { Habit }            from '../../../../shared/models/habit.model';
import { Task, TaskStatus, TaskPriority } from '../../../../shared/models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {

  private authService  = inject(AuthService);
  private xpService     = inject(XPService);
  private habitService  = inject(HabitService);
  private taskService   = inject(TaskService);
  private cdr           = inject(ChangeDetectorRef);

  userName  = signal('User');
  isLoading = signal(true);
  errorMsg  = signal('');

  // ─── Data from API ──────────────────────────────────
  summary   = signal<DashboardSummary | null>(null);
  habits    = signal<Habit[]>([]);
  tasks     = signal<Task[]>([]);

  // ─── Computed from real API data ────────────────────
  totalXP = computed(() => this.summary()?.xp.totalXP ?? 0);
  todayXP = computed(() => this.summary()?.xp.todayXP ?? 0);

  level       = computed(() => this.summary()?.xp.level ?? 1);
  levelTitle  = computed(() => this.summary()?.xp.levelTitle ?? 'Initiate');
  levelProgress = computed(() => this.summary()?.xp.levelProgressPercent ?? 0);
  levelCurrentXP  = computed(() => this.summary()?.xp.levelCurrentXP ?? 0);
  levelRequiredXP = computed(() => this.summary()?.xp.levelRequiredXP ?? 100);

  totalHabits    = computed(() => this.summary()?.totalHabits    ?? 0);
  completedToday = computed(() => this.summary()?.completedToday ?? 0);
  currentStreak  = computed(() => this.summary()?.currentStreak  ?? 0);

  totalTasks     = computed(() => this.summary()?.totalTasks     ?? 0);
  pendingTasks   = computed(() => this.summary()?.pendingTasks   ?? 0);
  completedTasks = computed(() => this.summary()?.completedTasks ?? 0);
  overdueTasks   = computed(() => this.summary()?.overdueTasks   ?? 0);

  todayScore = computed(() => this.summary()?.todayScore ?? 0);
  todayGrade = computed(() => this.summary()?.todayGrade ?? 'D');

  // نسبة إنجاز اليوم (Habits + Tasks)
  completionRate = computed(() => {
    const total     = this.totalHabits() + this.totalTasks();
    const completed = this.completedToday() + this.completedTasks();
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  });

  rankTier = computed(() => {
    const l = this.level();
    if (l < 5)  return 'RANK TIER I';
    if (l < 10) return 'RANK TIER II';
    if (l < 20) return 'RANK TIER III';
    return 'RANK TIER IV';
  });

  gradeColor = computed(() => {
    const g = this.todayGrade();
    if (g === 'S') return '#fbbf24';
    if (g === 'A') return '#a4e6ff';
    if (g === 'B') return '#6ee7b7';
    if (g === 'C') return '#ffad82';
    return '#f87171';
  });

  // Top 3 habits للعرض
  activeHabits = computed(() => this.habits().slice(0, 3));

  // Top 3 pending tasks
  priorityQueue = computed(() =>
    this.tasks()
      .filter(t => t.status !== TaskStatus.Completed)
      .slice(0, 3)
  );

  // آخر 5 XP transactions
  recentXP = computed(() =>
    this.summary()?.xp.recentTransactions.slice(0, 5) ?? []
  );

  today = new Date();
  TaskStatus   = TaskStatus;
  TaskPriority = TaskPriority;

  private sub?: Subscription;

  ngOnInit(): void {
    this.userName.set(this.authService.getUserName());
    this.loadDashboard();
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.errorMsg.set('');
    this.cdr.detectChanges();

    this.xpService.getDashboard().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loadLists();
      },
      error: () => {
        this.errorMsg.set('Failed to load dashboard data.');
        this.isLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  private loadLists(): void {
    this.habitService.getHabits().subscribe({
      next: (h) => {
        this.habits.set(h);
        this.cdr.detectChanges();
      }
    });
    this.taskService.getAllTasks().subscribe({
      next:  (t) => { 
        this.tasks.set(t); 
        this.isLoading.set(false); 
        this.cdr.detectChanges();
      },
      error: ()  => {
        this.isLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  getPriorityLabel(p: TaskPriority): string {
    return ['Low', 'Medium', 'High'][p] ?? 'Unknown';
  }

  getSourceIcon(source: string): string {
    const icons: Record<string, string> = {
      Habit: '🔥', Task: '✅', Challenge: '🏆', Pomodoro: '🍅', Badge: '🎖', Team: '👥'
    };
    return icons[source] ?? '⚡';
  }
}
