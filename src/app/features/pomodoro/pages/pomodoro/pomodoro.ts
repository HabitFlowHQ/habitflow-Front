// ============================================================
// 📁 src/app/features/pomodoro/pages/pomodoro/pomodoro.ts
// ============================================================
// 🎯 الهدف: صفحة Pomodoro Timer الكاملة
// ============================================================
 
import {
  Component, OnInit, OnDestroy, signal,
  computed, ChangeDetectorRef
} from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { PomodoroService }   from '../../../../core/services/pomodoro.service';
import { TaskService }       from '../../../../core/services/task.service';
import {
  PomodoroSession,
  PomodoroStats
} from '../../../../shared/models/pomodoro.model';
import { Task } from '../../../../shared/models/task.model';
 
// أنواع الجلسات
type SessionType = 'Work' | 'ShortBreak' | 'LongBreak';
type TimerState  = 'idle' | 'running' | 'paused';
 
@Component({
  selector: 'app-pomodoro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pomodoro.html',
  styleUrl: './pomodoro.scss'
})
export class Pomodoro implements OnInit, OnDestroy {
 
  // ============================================================
  // 📌 Timer State — حالة المؤقت
  // ============================================================
 
  // الحالة الحالية للمؤقت
  timerState: TimerState = 'idle';
 
  // نوع الجلسة الحالية
  sessionType: SessionType = 'Work';
 
  // المدد الافتراضية (بالدقائق)
  durations = { Work: 25, ShortBreak: 5, LongBreak: 15 };
 
  // الثواني المتبقية — نبدأ بـ 25 * 60
  secondsLeft = signal(25 * 60);
 
  // الجلسة الجارية (بعد إرسالها للـ Backend)
  activeSession: PomodoroSession | null = null;
 
  // عداد جلسات اليوم
  completedToday = 0;
 
  // ============================================================
  // 📌 المفهوم - computed في Angular Signals
  // ============================================================
 
  // الدقائق المتبقية
  minutes = computed(() => Math.floor(this.secondsLeft() / 60));
 
  // الثواني المتبقية (بعد طرح الدقائق)
  seconds = computed(() => this.secondsLeft() % 60);
 
  // نسبة التقدم (0 إلى 1) للـ Progress Ring
  progress = computed(() => {
    const total = this.durations[this.sessionType] * 60;
    return (total - this.secondsLeft()) / total;
  });
 
  // الـ stroke-dashoffset للـ SVG Circle
  // 📌 الـ Circle محيطه = 2 * π * r = 2 * 3.14159 * 54 ≈ 339.3
  readonly CIRCLE_CIRCUMFERENCE = 339.3;
  dashOffset = computed(() =>
    this.CIRCLE_CIRCUMFERENCE * (1 - this.progress())
  );
 
  // ============================================================
  // 📌 البيانات
  // ============================================================
  stats: PomodoroStats | null = null;
  tasks: Task[] = [];                      // لاختيار مهمة للربط
  selectedTaskId: number | null = null;    // المهمة المختارة
  isLoadingStats = false;
 
  // ============================================================
  // 📌 Timer Internal
  // ============================================================
  private intervalId: ReturnType<typeof setInterval> | null = null;
 
  constructor(
    private pomodoroService: PomodoroService,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) {}
 
  ngOnInit(): void {
    this.loadStats();
    this.loadTasks();
    this.checkActiveSession();  // هل يوجد جلسة جارية من قبل؟
  }
 
  ngOnDestroy(): void {
    this.stopInterval();
  }
 
  // ============================================================
  // 1️⃣ checkActiveSession — استئناف جلسة جارية
  // ============================================================
  checkActiveSession(): void {
    this.pomodoroService.getActiveSession().subscribe({
      next: (session) => {
        if (session) {
          this.activeSession = session;
          this.sessionType   = session.sessionType as SessionType;
 
          // نحسب كم ثانية مضت منذ البدء
          const started  = new Date(session.startTime).getTime();
          const now      = Date.now();
          const elapsed  = Math.floor((now - started) / 1000);
          const total    = session.durationMinutes * 60;
          const remaining = Math.max(0, total - elapsed);
 
          this.secondsLeft.set(remaining);
 
          // إذا لا يزال هناك وقت → استأنف
          if (remaining > 0) {
            this.timerState = 'running';
            this.startInterval();
          } else {
            // انتهى الوقت أثناء الغياب → أنهِه تلقائياً
            this.onTimerComplete();
          }
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });
  }
 
  // ============================================================
  // 2️⃣ changeSessionType — تغيير نوع الجلسة
  // ============================================================
  changeSessionType(type: SessionType): void {
    if (this.timerState === 'running') return;
 
    this.sessionType = type;
    this.secondsLeft.set(this.durations[type] * 60);
    this.timerState = 'idle';
    this.cdr.detectChanges();
  }
 
  // ============================================================
  // 3️⃣ startTimer — بدء الجلسة
  // ============================================================
  startTimer(): void {
    if (this.timerState === 'running') return;
 
    // إذا كانت pause → استأنف بدون API call
    if (this.timerState === 'paused' && this.activeSession) {
      this.timerState = 'running';
      this.startInterval();
      this.cdr.detectChanges();
      return;
    }
 
    // جلسة جديدة → أرسل للـ Backend أولاً
    this.pomodoroService.startSession({
      sessionType:     this.sessionType,
      durationMinutes: this.durations[this.sessionType],
      taskItemId:      this.selectedTaskId ?? undefined
    }).subscribe({
      next: (session) => {
        this.activeSession = session;
        this.timerState    = 'running';
        this.secondsLeft.set(this.durations[this.sessionType] * 60);
        this.startInterval();
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to start Pomodoro session.';
        alert(msg);
        this.cdr.detectChanges();
      }
    });
  }
 
  // ============================================================
  // 4️⃣ pauseTimer — إيقاف مؤقت
  // ============================================================
  pauseTimer(): void {
    if (this.timerState !== 'running') return;
    this.timerState = 'paused';
    this.stopInterval();
    this.cdr.detectChanges();
  }
 
  // ============================================================
  // 5️⃣ cancelTimer — إلغاء الجلسة
  // ============================================================
  cancelTimer(): void {
    if (!this.activeSession) {
      this.resetTimer();
      this.cdr.detectChanges();
      return;
    }
 
    if (!confirm('Cancel session? You will not earn XP.')) return;
 
    // أرسل للـ Backend: isCompleted = false (ملغاة)
    this.pomodoroService.completeSession(this.activeSession.id, {
      isCompleted: false
    }).subscribe({
      next: () => {
        this.resetTimer();
        this.loadStats(); // حدّث الإحصائيات
        this.cdr.detectChanges();
      },
      error: () => {
        this.resetTimer();
        this.cdr.detectChanges();
      }
    });
  }
 
  // ============================================================
  // 6️⃣ onTimerComplete — اكتمال الجلسة (الوقت انتهى)
  // ============================================================
  private onTimerComplete(): void {
    this.stopInterval();
    this.secondsLeft.set(0);
 
    if (!this.activeSession) {
      this.cdr.detectChanges();
      return;
    }
 
    // أرسل للـ Backend: isCompleted = true → يكسب XP
    this.pomodoroService.completeSession(this.activeSession.id, {
      isCompleted: true
    }).subscribe({
      next: (session) => {
        this.timerState = 'idle';
        this.completedToday++;
 
        if (session.xpEarned > 0) {
          alert(`🎉 Session completed! You earned ${session.xpEarned} XP!`);
        }
 
        this.activeSession = null;
        this.loadStats();
 
        if (this.sessionType === 'Work') {
          const nextBreak = this.completedToday % 4 === 0
            ? 'LongBreak' : 'ShortBreak';
          this.changeSessionType(nextBreak);
        } else {
          this.changeSessionType('Work');
        }
 
        this.cdr.detectChanges();
      },
      error: () => {
        this.resetTimer();
        this.cdr.detectChanges();
      }
    });
  }
 
  // ============================================================
  // Helpers
  // ============================================================
 
  private startInterval(): void {
    this.intervalId = setInterval(() => {
      const current = this.secondsLeft();
      if (current <= 1) {
        this.onTimerComplete();
      } else {
        this.secondsLeft.set(current - 1);
      }
      this.cdr.detectChanges();
    }, 1000);
  }
 
  private stopInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
 
  private resetTimer(): void {
    this.stopInterval();
    this.timerState    = 'idle';
    this.activeSession = null;
    this.secondsLeft.set(this.durations[this.sessionType] * 60);
  }
 
  loadStats(): void {
    this.isLoadingStats = true;
    this.cdr.detectChanges();
    this.pomodoroService.getStats().subscribe({
      next:  (s) => {
        this.stats = s;
        this.isLoadingStats = false;
        this.cdr.detectChanges();
      },
      error: ()  => {
        this.isLoadingStats = false;
        this.cdr.detectChanges();
      }
    });
  }
 
  loadTasks(): void {
    this.taskService.getAllTasks().subscribe({
      next:  (tasks) => {
        this.tasks = tasks;
        this.cdr.detectChanges();
      },
      error: ()      => {
        this.cdr.detectChanges();
      }
    });
  }
 
  // ============================================================
  // 📌 Template Helpers
  // ============================================================
 
  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }
 
  get ringColor(): string {
    if (this.sessionType === 'Work')       return '#a4e6ff';  // Primary
    if (this.sessionType === 'ShortBreak') return '#6ee7b7';  // Green
    return '#c4b5fd';                                          // Purple
  }
 
  get statusLabel(): string {
    if (this.timerState === 'running') {
      return this.sessionType === 'Work' ? '🔥 Focus Mode' : '☕ Break Mode';
    }
    if (this.timerState === 'paused') return '⏸ Paused';
    return this.sessionType === 'Work' ? 'Ready to Focus' : 'Ready for Break';
  }
 
  get selectedTaskTitle(): string {
    if (!this.selectedTaskId) return 'No Task';
    return this.tasks.find(t => t.id === this.selectedTaskId)?.title ?? 'No Task';
  }
}
