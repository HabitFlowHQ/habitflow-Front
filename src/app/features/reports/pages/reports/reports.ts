import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe }     from '@angular/common';
import { FormsModule }                from '@angular/forms';
import { ReportService }              from '../../../../core/services/report.service';
import { WeeklyReport, MonthlyReport } from '../../../../shared/models/report.model';

@Component({
  selector:    'app-reports',
  standalone:  true,
  imports:     [CommonModule, FormsModule, DatePipe],
  templateUrl: './reports.html',
  styleUrl:    './reports.scss',
})
export class Reports implements OnInit {

  private reportService = inject(ReportService);
  private cdr           = inject(ChangeDetectorRef);

  activeTab: 'weekly' | 'monthly' = 'weekly';

  weekly:  WeeklyReport  | null = null;
  monthly: MonthlyReport | null = null;

  isLoading    = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadWeekly();
  }

  switchTab(tab: 'weekly' | 'monthly'): void {
    this.activeTab = tab;
    if (tab === 'weekly'  && !this.weekly)  this.loadWeekly();
    if (tab === 'monthly' && !this.monthly) this.loadMonthly();
    this.cdr.detectChanges();
  }

  loadWeekly(): void {
    this.isLoading    = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.reportService.getWeeklyReport().subscribe({
      next:  (r) => { 
        this.weekly = r;  
        this.isLoading = false; 
        this.cdr.detectChanges();
      },
      error: ()  => { 
        this.errorMessage = 'Failed to load weekly report.'; 
        this.isLoading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  loadMonthly(): void {
    this.isLoading    = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.reportService.getMonthlyReport().subscribe({
      next:  (r) => { 
        this.monthly = r; 
        this.isLoading = false; 
        this.cdr.detectChanges();
      },
      error: ()  => { 
        this.errorMessage = 'Failed to load monthly report.'; 
        this.isLoading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  // ── Print as PDF ─────────────────────────────────
  printReport(): void {
    window.print();
  }

  // ── Grade Color ──────────────────────────────────
  gradeColor(grade: string): string {
    const map: Record<string, string> = {
      S: '#fbbf24', A: '#a4e6ff', B: '#6ee7b7', C: '#ffad82', D: '#f87171'
    };
    return map[grade] ?? '#64748b';
  }

  // ── Bar width for charts ─────────────────────────
  barWidth(value: number, max: number): number {
    return max === 0 ? 0 : Math.round((value / max) * 100);
  }

  maxXP(items: { xp: number }[]): number {
    return Math.max(...items.map(i => i.xp), 1);
  }

  maxScore(items: { score: number }[]): number {
    return Math.max(...items.map(i => i.score), 1);
  }
}
