import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { XPSummary, DashboardSummary } from '../../shared/models/xp.model';

@Injectable({ providedIn: 'root' })
export class XPService {

  private readonly baseUrl = 'http://localhost:5066/api/xp';
  private http = inject(HttpClient);

  // XP + Level + آخر 10 معاملات
  getXPSummary(): Observable<XPSummary> {
    return this.http.get<XPSummary>(`${this.baseUrl}/summary`);
  }

  // كل بيانات Dashboard في طلب واحد
  getDashboard(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard`);
  }
}
