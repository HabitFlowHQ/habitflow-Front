

export interface PomodoroSession {
  id: number;
  sessionType: string;        // 'Work' | 'ShortBreak' | 'LongBreak'
  durationMinutes: number;
  startTime: string;
  endTime: string | null;     // null = جلسة جارية حالياً
  isCompleted: boolean;
  xpEarned: number;
  taskItemId: number | null;
  taskTitle: string | null;
}

export interface StartPomodoroDto {
  sessionType: string;
  durationMinutes: number;
  taskItemId?: number;        // اختياري
}

export interface CompleteSessionDto {
  isCompleted: boolean;       // true = اكتملت | false = ألغيت
}

export interface PomodoroStats {
  totalCompletedSessions: number;
  totalMinutesWorked: number;
  totalXpEarned: number;
  todaySessions: number;
  todayMinutes: number;
  recentSessions: PomodoroSession[];
}
