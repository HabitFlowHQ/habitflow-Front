import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Project, ProjectDetail,
  CreateProjectDto, UpdateProjectDto,
  ProjectTask, CreateProjectTaskDto
} from '../../shared/models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {

  private readonly apiUrl = 'http://localhost:5066/api/projects';
  private http = inject(HttpClient);

  // Projects
  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getById(id: number): Observable<ProjectDetail> {
    return this.http.get<ProjectDetail>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateProjectDto): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  toggleComplete(id: number): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/${id}/complete`, {});
  }

  // Tasks
  addTask(projectId: number, dto: CreateProjectTaskDto): Observable<ProjectTask> {
    return this.http.post<ProjectTask>(`${this.apiUrl}/${projectId}/tasks`, dto);
  }

  updateTaskStatus(projectId: number, taskId: number, status: string): Observable<ProjectTask> {
    return this.http.patch<ProjectTask>(
      `${this.apiUrl}/${projectId}/tasks/${taskId}/status`,
      { status }
    );
  }

  deleteTask(projectId: number, taskId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${projectId}/tasks/${taskId}`
    );
  }
}
