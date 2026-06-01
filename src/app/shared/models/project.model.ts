export interface ProjectTask {
  id:          number;
  title:       string;
  description: string | null;
  status:      'Todo' | 'InProgress' | 'Done';
  sortOrder:   number;
  createdAt:   string;
}

export interface Project {
  id:              number;
  title:           string;
  description:     string | null;
  color:           string | null;
  icon:            string | null;
  dueDate:         string | null;
  isCompleted:     boolean;
  totalTasks:      number;
  completedTasks:  number;
  progressPercent: number;
  createdAt:       string;
  updatedAt:       string;
}

export interface ProjectDetail extends Project {
  tasks: ProjectTask[];
}

export interface CreateProjectDto {
  title:       string;
  description: string;
  color:       string;
  icon:        string;
  dueDate:     string | null;
}

export interface UpdateProjectDto extends CreateProjectDto {}

export interface CreateProjectTaskDto {
  title:       string;
  description: string;
  status:      string;
}
