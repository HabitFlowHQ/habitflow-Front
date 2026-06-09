import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Habit, CreateHabitDto, UpdateHabitDto } from '../../shared/models/habit.model';

@Injectable({
  providedIn: 'root', //Golbal service available throughout the app
})
export class HabitService {

  private readonly apiUrl = 'http://localhost:5066/api/habit';

  constructor(private http: HttpClient) {} //httpclient to make api calls
//Observable : wating for response from api and handle it asynchronously
  getHabits(): Observable<Habit[]> {
    return this.http.get<Habit[]>(this.apiUrl);
  }//[] because we expect an array of habits

  getHabitById(id: number): Observable<Habit> {
    return this.http.get<Habit>(`${this.apiUrl}/${id}`);
  }

  createHabit(dto: CreateHabitDto): Observable<Habit> {
    return this.http.post<Habit>(this.apiUrl, dto);
  }

  updateHabit(id: number, dto: UpdateHabitDto): Observable<Habit> {
    return this.http.put<Habit>(`${this.apiUrl}/${id}`, dto);
  }

  deleteHabit(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  completeHabit(id: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/${id}/complete`, {}, { responseType: 'text' });
  }
}
