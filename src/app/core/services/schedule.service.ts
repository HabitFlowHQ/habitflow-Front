import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ScheduleResponse } from '../../shared/models/schedule.model';

@Injectable({ providedIn: 'root' })
export class ScheduleService {

  private readonly apiUrl = 'http://localhost:5066/api/schedule';
  private http = inject(HttpClient);

  getSchedule(date?: string): Observable<ScheduleResponse> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<ScheduleResponse>(this.apiUrl, { params });
  }
}
