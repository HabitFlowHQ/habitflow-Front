export interface ScheduleHabit {
  id:             number;
  title:          string;
  category:       string;
  frequencyType:  string;
  color:          string | null;
  icon:           string | null;
  currentStreak:  number;
  isCompleted:    boolean;
  completedCount: number;
  targetCount:    number;
}

export interface ScheduleTask {
  id:               number;
  title:            string;
  description:      string | null;
  priority:         string;   // Low | Medium | High
  status:           string;   // Pending | InProgress | Completed
  dueDate:          string | null;
  estimatedMinutes: number;
  isOverdue:        boolean;
}

export interface ScheduleResponse {
  date:            string;   // "2026-05-30"
  dayName:         string;   // "Saturday"
  habits:          ScheduleHabit[];
  tasks:           ScheduleTask[];
  totalHabits:     number;
  completedHabits: number;
  totalTasks:      number;
  completedTasks:  number;
}
