// Matches HabitResponseDto from Backend
export interface Habit {
  id: number;
  title: string;          
  description?: string;
  category: string;
  frequencyType: string;  
  targetCount: number;
  currentStreak: number;
  longestStreak: number;
  color?: string;
  icon?: string;
  completedToday?: boolean;
  isDotted?: boolean;
  isMock?: boolean;
}

export interface CreateHabitDto {
  title: string;
  description?: string;
  category: string;
  frequencyType: string;
  targetCount: number;
  color?: string;
  icon?: string;
}

export interface UpdateHabitDto {
  title: string;
  description?: string;
  category: string;
  frequencyType: string;
  targetCount: number;
  color?: string;
  icon?: string;
}
