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
  endDate: string;
  createdAt: string;
  isDotted?: boolean;
  isMock?: boolean;
}

export interface CreateHabitDto {
  title: string;
  description?: string;
  category: string;
  color?: string;
  icon?: string;
  endDate: string;
  createdAt?: string;
}

export interface UpdateHabitDto {
  title: string;
  description?: string;
  category: string;
  color?: string;
  icon?: string;
  endDate: string;
  createdAt?: string;
}
