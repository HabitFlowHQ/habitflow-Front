import { Injectable }  from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';

import {
  Task,
  TaskDetails,
  CreateTaskDto,
  UpdateTaskDto,
  CompleteTaskRequest
} from '../../shared/models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {

  private readonly apiUrl = 'http://localhost:5066/api/task';

  constructor(private http: HttpClient) {}

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getTaskById(id: number): Observable<TaskDetails> {
    return this.http.get<TaskDetails>(`${this.apiUrl}/${id}`);
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, dto);
  }

  updateTask(id: number, dto: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, dto);
  }

  deleteTask(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  startTask(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/${id}/start`,
      {}
    );
  }

  completeTask(id: number, request: CompleteTaskRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/${id}/complete`,
      request
    );
  }
  
}
