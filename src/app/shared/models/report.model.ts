export interface DailyXP {
  day:  string;   // "Mon"
  date: string;   // "2026-05-26"
  xp:   number;
}

export interface WeeklyXP {
  weekLabel: string;
  xp:        number;
}

export interface DailyScore {
  date:  string;
  day:   string;
  score: number;
}

export interface HabitSummary {
  id:             number;
  title:          string;
  icon:           string | null;
  color:          string | null;
  currentStreak:  number;
  completionRate: number;
}

export interface TaskSummary {
  id:          number;
  title:       string;
  priority:    string;
  status:      string;
  completedAt: string | null;
}

export interface WeeklyReport {
  weekLabel:          string;
  weekStart:          string;
  weekEnd:            string;
  totalXP:            number;
  weekXP:             number;
  dailyXP:            DailyXP[];
  totalHabits:        number;
  habitsCompleted:    number;
  habitCompletionRate: number;
  bestStreak:         number;
  topHabits:          HabitSummary[];
  totalTasks:         number;
  tasksCompleted:     number;
  tasksPending:       number;
  tasksOverdue:       number;
  taskCompletionRate: number;
  recentTasks:        TaskSummary[];
  avgDailyScore:      number;
  weekGrade:          string;
  dailyScores:        DailyScore[];
  currentLevel:       number;
  levelTitle:         string;
  levelProgress:      number;
  userName:           string;
  generatedAt:        string;
}

export interface MonthlyReport {
  monthLabel:          string;
  monthStart:          string;
  monthEnd:            string;
  monthXP:             number;
  totalXP:             number;
  weeklyXP:            WeeklyXP[];
  habitCompletionRate: number;
  bestStreak:          number;
  activeHabits:        number;
  topHabits:           HabitSummary[];
  tasksCompleted:      number;
  tasksOverdue:        number;
  taskCompletionRate:  number;
  avgMonthlyScore:     number;
  monthGrade:          string;
  dailyScores:         DailyScore[];
  notesCreated:        number;
  projectsCompleted:   number;
  currentLevel:        number;
  levelTitle:          string;
  xpGainedThisMonth:   number;
  userName:            string;
  generatedAt:         string;
}
