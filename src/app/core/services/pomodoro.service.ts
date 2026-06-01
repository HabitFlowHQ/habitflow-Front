// ============================================================
// 📁 src/app/core/services/pomodoro.service.ts
// ============================================================
// 🎯 الهدف: HTTP calls للـ Pomodoro API
// ============================================================
 
import { Injectable }  from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable, throwError, of }  from 'rxjs';
import { catchError } from 'rxjs/operators';
 
import {
  PomodoroSession,
  StartPomodoroDto,
  CompleteSessionDto,
  PomodoroStats
} from '../../shared/models/pomodoro.model';
 
@Injectable({ providedIn: 'root' })
export class PomodoroService {
 
  private readonly apiUrl = 'http://localhost:5066/api/pomodoro';
 
  constructor(private http: HttpClient) {}
 
  // LocalStorage Helpers for robust fallback simulation
  private getLocalSessions(): PomodoroSession[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('local_pomodoro_sessions');
    return data ? JSON.parse(data) : [];
  }
 
  private saveLocalSessions(sessions: PomodoroSession[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('local_pomodoro_sessions', JSON.stringify(sessions));
    }
  }
 
  private getLocalActiveSession(): PomodoroSession | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem('local_pomodoro_active');
    return data ? JSON.parse(data) : null;
  }
 
  private saveLocalActiveSession(session: PomodoroSession | null) {
    if (typeof window !== 'undefined') {
      if (session) {
        localStorage.setItem('local_pomodoro_active', JSON.stringify(session));
      } else {
        localStorage.removeItem('local_pomodoro_active');
      }
    }
  }
 
  private getLocalStats(): PomodoroStats {
    const sessions = this.getLocalSessions();
    const completed = sessions.filter(s => s.isCompleted);
    const todayStr = new Date().toDateString();
    const todaySessions = completed.filter(s => new Date(s.startTime).toDateString() === todayStr);
 
    const totalMinutes = completed.reduce((sum, s) => sum + s.durationMinutes, 0);
    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalXp = completed.reduce((sum, s) => sum + s.xpEarned, 0);
 
    return {
      totalCompletedSessions: completed.length,
      totalMinutesWorked: totalMinutes,
      totalXpEarned: totalXp,
      todaySessions: todaySessions.length,
      todayMinutes: todayMinutes,
      recentSessions: sessions.slice(-10).reverse()
    };
  }
 
  // ▶️ POST api/pomodoro/start
  startSession(dto: StartPomodoroDto): Observable<PomodoroSession> {
    return this.http.post<PomodoroSession>(`${this.apiUrl}/start`, dto).pipe(
      catchError(err => {
        console.warn('Backend Pomodoro API missing. Falling back to local storage simulation.', err);
        // Local simulation
        const currentActive = this.getLocalActiveSession();
        if (currentActive) {
          return throwError(() => ({ error: { message: 'You already have an active Pomodoro session!' } }));
        }
 
        const newSession: PomodoroSession = {
          id: Math.floor(Math.random() * 10000) + 1,
          sessionType: dto.sessionType,
          durationMinutes: dto.durationMinutes,
          startTime: new Date().toISOString(),
          endTime: null,
          isCompleted: false,
          xpEarned: 0,
          taskItemId: dto.taskItemId ?? null,
          taskTitle: null // will be populated in frontend if linked
        };
        this.saveLocalActiveSession(newSession);
        return of(newSession);
      })
    );
  }
 
  // ⏹️ POST api/pomodoro/{id}/complete
  completeSession(id: number, dto: CompleteSessionDto): Observable<PomodoroSession> {
    return this.http.post<PomodoroSession>(
      `${this.apiUrl}/${id}/complete`, dto
    ).pipe(
      catchError(err => {
        console.warn('Backend Pomodoro API missing. Falling back to local storage simulation.', err);
        const active = this.getLocalActiveSession();
        if (!active) {
          return throwError(() => ({ error: { message: 'No active session found.' } }));
        }
 
        active.isCompleted = dto.isCompleted;
        active.endTime = new Date().toISOString();
        active.xpEarned = dto.isCompleted ? (active.sessionType === 'Work' ? 100 : 25) : 0;
 
        // Save to sessions log
        const sessions = this.getLocalSessions();
        sessions.push(active);
        this.saveLocalSessions(sessions);
 
        // Clear active session
        this.saveLocalActiveSession(null);
 
        return of(active);
      })
    );
  }
 
  // 📋 GET api/pomodoro
  getSessions(): Observable<PomodoroSession[]> {
    return this.http.get<PomodoroSession[]>(this.apiUrl).pipe(
      catchError(err => {
        return of(this.getLocalSessions());
      })
    );
  }
 
  // 🔍 GET api/pomodoro/active
  // يُستدعى عند تحميل الصفحة لمعرفة هل يوجد جلسة جارية
  getActiveSession(): Observable<PomodoroSession | null> {
    return this.http.get<PomodoroSession | null>(`${this.apiUrl}/active`).pipe(
      catchError(err => {
        return of(this.getLocalActiveSession());
      })
    );
  }
 
  // 📊 GET api/pomodoro/stats
  getStats(): Observable<PomodoroStats> {
    return this.http.get<PomodoroStats>(`${this.apiUrl}/stats`).pipe(
      catchError(err => {
        return of(this.getLocalStats());
      })
    );
  }
}
