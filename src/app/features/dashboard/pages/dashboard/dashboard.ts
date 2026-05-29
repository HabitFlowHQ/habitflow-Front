import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';

import { AuthService }  from '../../../../core/services/auth.service';
import { HabitService } from '../../../../core/services/habit.service';
import { TaskService }  from '../../../../core/services/task.service';

import { Habit }       from '../../../../shared/models/habit.model';
import { Task, TaskStatus, TaskPriority } from '../../../../shared/models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {

  userName   = signal('User');
  habits     = signal<Habit[]>([]);
  tasks      = signal<Task[]>([]);
  isLoading  = signal(true);
  errorMsg   = signal('');
  today      = new Date();

  // computed stats
  totalHabits  = computed(() => this.habits().length);
  totalTasks   = computed(() => this.tasks().length);
  pendingTasks = computed(() =>
    this.tasks().filter(t => t.status === TaskStatus.Pending).length
  );
  completedTasks = computed(() =>
    this.tasks().filter(t => t.status === TaskStatus.Completed).length
  );
  totalXp = computed(() => {
    return this.habits().reduce((sum, h) => sum + h.currentStreak * 10, 0) + 
           (this.tasks().filter(t => t.status === TaskStatus.Completed).length * 50);
  });
  completionRate = computed(() => {
    if (this.tasks().length === 0) return 0;
    const dbCompleted = this.tasks().filter(t => t.status === TaskStatus.Completed).length;
    return Math.round((dbCompleted * 100) / this.tasks().length);
  });
  currentLevel = computed(() => {
    return Math.floor(this.totalXp() / 500) + 1;
  });
  levelProgressPercent = computed(() => {
    return ((this.totalXp() % 500) * 100) / 500;
  });
  levelProgressXp = computed(() => {
    return this.totalXp() % 500;
  });
  maxStreak = computed(() => {
    if (this.habits().length === 0) return 0;
    return Math.max(...this.habits().map(h => h.currentStreak), 0);
  });

  rankTitle = computed(() => {
    const lvl = this.currentLevel();
    if (lvl < 5) return 'Initiate';
    if (lvl < 10) return 'Specialist';
    if (lvl < 20) return 'Strategist';
    if (lvl < 30) return 'Master';
    if (lvl < 45) return 'Architect';
    return 'Grandmaster';
  });

  rankTier = computed(() => {
    const lvl = this.currentLevel();
    if (lvl < 5) return 'RANK TIER I';
    if (lvl < 10) return 'RANK TIER I';
    if (lvl < 20) return 'RANK TIER II';
    if (lvl < 30) return 'RANK TIER II';
    if (lvl < 45) return 'RANK TIER III';
    return 'RANK TIER IV';
  });

  // recent 5 tasks
  recentTasks = computed(() =>
    [...this.tasks()].slice(0, 5)
  );

  // active habits padded with high-fidelity mockup routines
  activeHabits = computed(() => {
    const dbHabits = [...this.habits()];
    const mockHabits: any[] = [
      { id: 9991, title: 'Hydration Protocol', category: 'VITALITY', icon: 'water_drop', currentStreak: 14, completedToday: true, isMock: true },
      { id: 9992, title: 'Physical Training', category: 'STRENGTH', icon: 'fitness_center', currentStreak: 5, completedToday: false, isMock: true },
      { id: 9993, title: 'Deep Reading (30m)', category: 'INTELLECT', icon: 'menu_book', currentStreak: 8, completedToday: false, isDotted: true, isMock: true }
    ];
    const merged = [...dbHabits];
    for (const mock of mockHabits) {
      if (merged.length >= 3) break;
      if (!merged.some(h => h.title.toLowerCase() === mock.title.toLowerCase())) {
        merged.push(mock);
      }
    }
    return merged.slice(0, 3);
  });

  // priority queue tasks padded with high-fidelity mockup tasks
  priorityQueue = computed(() => {
    const dbTasks = this.tasks().filter(t => t.status !== TaskStatus.Completed);
    const mockTasks: any[] = [
      { id: 9991, title: 'Finalize Q3 API Documentation', priority: TaskPriority.High, isMock: true, mockLabel: 'DUE 14:00 • HIGH PRIORITY' },
      { id: 9992, title: 'Review Pull Requests for Auth Module', priority: TaskPriority.Medium, isMock: true, mockLabel: 'PROJECT: CORE' },
      { id: 9993, title: 'Sync with Design Team on Component Library', priority: TaskPriority.Low, isMock: true, mockLabel: '15:30 - 16:00' }
    ];
    const merged = [...dbTasks];
    for (const mock of mockTasks) {
      if (merged.length >= 3) break;
      if (!merged.some(t => t.title.toLowerCase() === mock.title.toLowerCase())) {
        merged.push(mock);
      }
    }
    return merged.slice(0, 3);
  });

  private sub?: Subscription;

  // Expose enums to template
  TaskStatus   = TaskStatus;
  TaskPriority = TaskPriority;

  constructor(
    private authService:  AuthService,
    private habitService: HabitService,
    private taskService:  TaskService,
  ) {}

  ngOnInit(): void {
    this.userName.set(this.authService.getUserName());
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.errorMsg.set('');

    this.sub = forkJoin({
      habits: this.habitService.getHabits(),
      tasks:  this.taskService.getAllTasks(),
    }).subscribe({
      next: ({ habits, tasks }) => {
        this.habits.set(habits);
        this.tasks.set(tasks);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Dashboard load error:', err);
        this.errorMsg.set('Failed to load dashboard data.');
        this.isLoading.set(false);
      }
    });
  }

  getPriorityLabel(p: TaskPriority): string {
    return ['Low', 'Medium', 'High'][p] ?? 'Unknown';
  }

  getStatusLabel(s: TaskStatus): string {
    return ['Pending', 'In Progress', 'Completed'][s] ?? 'Unknown';
  }

  getFrequencyLabel(f: string): string {
    return f; // Backend sends "Daily" or "Weekly" directly
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }
}
