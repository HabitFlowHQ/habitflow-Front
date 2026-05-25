// Matches HabitResponseDto from Backend
export interface Habit {
  id: number;
  title: string;          // ← "title" not "name"
  description?: string;
  category: string;
  frequencyType: number;  // 0 = Daily, 1 = Weekly
  targetCount: number;
  currentStreak: number;
  longestStreak: number;
  color?: string;
  icon?: string;
}

export interface CreateHabitDto {
  title: string;
  description?: string;
  category: string;
  frequencyType: number;
  targetCount: number;
  color?: string;
  icon?: string;
}

export interface UpdateHabitDto {
  title: string;
  description?: string;
  category: string;
  frequencyType: number;
  targetCount: number;
  color?: string;
  icon?: string;
}
