export interface XPTransaction {
  id:          number;
  sourceType:  string;   // Habit | Task | Challenge | Pomodoro
  sourceId:    number;
  xpAmount:    number;
  description: string | null;
  createdAt:   string;
}

export interface XPSummary {
  totalXP:              number;
  todayXP:              number;
  weekXP:               number;
  level:                number;
  levelTitle:           string;
  levelCurrentXP:       number;
  levelRequiredXP:      number;
  levelProgressPercent: number;
  recentTransactions:   XPTransaction[];
}

export interface DashboardSummary {
  xp:             XPSummary;

  // Habits
  totalHabits:    number;
  completedToday: number;
  currentStreak:  number;

  // Tasks
  totalTasks:     number;
  pendingTasks:   number;
  completedTasks: number;
  overdueTasks:   number;

  // Daily
  todayScore:     number;   // 0-100
  todayGrade:     string;   // S/A/B/C/D
}
