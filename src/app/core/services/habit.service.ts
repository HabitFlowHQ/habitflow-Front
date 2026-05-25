import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Habit, CreateHabitDto, UpdateHabitDto } from '../../shared/models/habit.model';

@Injectable({
  providedIn: 'root',
})
export class HabitService {

  private readonly apiUrl = 'http://localhost:5066/api/habit';

  constructor(private http: HttpClient) {}

  getHabits(): Observable<Habit[]> {
    return this.http.get<Habit[]>(this.apiUrl);
  }

  getHabitById(id: number): Observable<Habit> {
    return this.http.get<Habit>(`${this.apiUrl}/${id}`);
  }

  createHabit(dto: CreateHabitDto): Observable<Habit> {
    return this.http.post<Habit>(this.apiUrl, dto);
  }

  updateHabit(id: number, dto: UpdateHabitDto): Observable<Habit> {
    return this.http.put<Habit>(`${this.apiUrl}/${id}`, dto);
  }

  deleteHabit(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  completeHabit(id: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/${id}/complete`, {});
  }
}
