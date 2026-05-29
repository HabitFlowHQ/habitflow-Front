
export enum TaskPriority {
  Low    = 0,
  Medium = 1,
  High   = 2
}

export enum TaskStatus {
  Pending    = 0,
  InProgress = 1,
  Completed  = 2
}

export enum TaskActionType {
  Created   = 0,
  Updated   = 1,
  Started   = 2,
  Completed = 3
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  estimatedMinutes: number;
  actualMinutes: number;
  isMock?: boolean;
  mockLabel?: string;
}

export interface TaskLog {
  actionType: TaskActionType;
  actionDate: string;
  notes?: string;
}

export interface TaskDetails extends Task {
  createdAt: string;
  completedAt?: string;
  logs: TaskLog[];
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  estimatedMinutes: number;
}

export interface UpdateTaskDto {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  estimatedMinutes: number;
}

export interface CompleteTaskRequest {
  actualMinutes: number;
}
