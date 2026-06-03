import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WeeklyReport, MonthlyReport } from '../../shared/models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {

  private readonly apiUrl = 'http://localhost:5066/api/reports';
  private http = inject(HttpClient);

  getWeeklyReport(weekStart?: string): Observable<WeeklyReport> {
    let params = new HttpParams();
    if (weekStart) params = params.set('weekStart', weekStart);
    return this.http.get<WeeklyReport>(`${this.apiUrl}/weekly`, { params });
  }

  getMonthlyReport(monthStart?: string): Observable<MonthlyReport> {
    let params = new HttpParams();
    if (monthStart) params = params.set('monthStart', monthStart);
    return this.http.get<MonthlyReport>(`${this.apiUrl}/monthly`, { params });
  }
}
