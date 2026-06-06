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
    const report = this.activeTab === 'weekly' ? this.weekly : this.monthly;
    if (!report) return;

    const isWeekly = this.activeTab === 'weekly';
    const w = this.weekly;
    const m = this.monthly;

    // ── Helper functions ──
    const fmt = (d: string | null | undefined, style: 'short' | 'medium' = 'short'): string => {
      if (!d) return '—';
      const date = new Date(d);
      if (isNaN(date.getTime())) return '—';
      if (style === 'medium') return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const fmtDay = (d: string): string => {
      const date = new Date(d);
      if (isNaN(date.getTime())) return d;
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const badgeColor = (type: string): string => {
      if (type === 'success') return 'background:#d1fae5;color:#065f46;border:1px solid #a7f3d0;';
      if (type === 'warning') return 'background:#fef3c7;color:#92400e;border:1px solid #fde68a;';
      if (type === 'danger')  return 'background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;';
      if (type === 'info')    return 'background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe;';
      return 'background:#f3f4f6;color:#374151;border:1px solid #d1d5db;';
    };

    const priorityBadge = (p: string): string => {
      if (p === 'High')   return `<span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase;${badgeColor('danger')}">${p}</span>`;
      if (p === 'Medium') return `<span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase;${badgeColor('warning')}">${p}</span>`;
      return `<span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase;${badgeColor('info')}">${p}</span>`;
    };

    const statusBadge = (completed: boolean): string =>
      completed
        ? `<span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase;${badgeColor('success')}">Completed</span>`
        : `<span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase;${badgeColor('warning')}">In Progress</span>`;

    const completionBadge = (rate: number): string => {
      const t = rate >= 90 ? 'success' : rate >= 70 ? 'warning' : 'danger';
      const label = rate >= 90 ? 'Excellent' : rate >= 70 ? 'Good' : 'Needs Improvement';
      return `<span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase;${badgeColor(t)}">${label}</span>`;
    };

    const progressBar = (pct: number, color = '#6366f1'): string =>
      `<div style="display:flex;align-items:center;gap:8px;">
        <div style="flex:1;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:${color};border-radius:4px;"></div>
        </div>
        <span style="font-size:11px;font-weight:700;color:#374151;">${pct}%</span>
      </div>`;

    const statCard = (icon: string, val: string | number, label: string): string =>
      `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;display:flex;align-items:center;gap:12px;">
        <span style="font-size:24px;">${icon}</span>
        <div>
          <div style="font-size:20px;font-weight:800;color:#0f172a;">${val}</div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin-top:2px;">${label}</div>
        </div>
      </div>`;

    const subStatCard = (label: string, val: string | number, type = ''): string => {
      const color = type === 'success' ? '#059669' : type === 'warning' ? '#d97706' : type === 'danger' ? '#dc2626' : '#0f172a';
      return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;text-align:center;">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:.05em;">${label}</div>
        <div style="font-size:16px;font-weight:800;color:${color};margin-top:4px;">${val}</div>
      </div>`;
    };

    const sectionTitle = (icon: string, title: string): string =>
      `<h2 style="font-size:16px;font-weight:800;color:#0f172a;display:flex;align-items:center;gap:8px;border-bottom:1.5px solid #e2e8f0;padding-bottom:8px;margin-bottom:16px;margin-top:0;">
        <span>${icon}</span> ${title}
      </h2>`;

    const tableStyles = `border-collapse:collapse;width:100%;font-size:12px;`;
    const thStyle = `background:#f1f5f9;color:#374151;font-weight:700;text-transform:uppercase;font-size:10px;letter-spacing:.04em;padding:10px 12px;border-bottom:1.5px solid #e2e8f0;text-align:left;`;
    const tdStyle = `padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#1e293b;vertical-align:middle;`;

    // ── Timeline builder ──
    const buildHabitTimeline = (r: any): string => {
      const groups = this.getGroupedHabits(r);
      if (!groups.length) return `<p style="color:#94a3b8;font-size:13px;text-align:center;padding:12px 0;">No habit timeline logs recorded for this period.</p>`;
      return groups.map(g => `
        <div style="border-left:2px solid #e2e8f0;margin-left:8px;padding-left:16px;padding-bottom:14px;position:relative;">
          <div style="font-size:11px;font-weight:700;color:#6366f1;margin-bottom:6px;position:relative;">
            <span style="position:absolute;left:-22px;top:2px;width:9px;height:9px;border-radius:50%;background:#6366f1;display:block;"></span>
            ${fmtDay(g.date)}
          </div>
          ${g.logs.map((l: any) =>
            `<div style="display:flex;align-items:center;gap:6px;font-size:12px;margin-bottom:4px;">
              <span>${l.isCompleted ? '✅' : '❌'}</span>
              <span style="font-weight:600;color:#1e293b;">${l.habitName}</span>
            </div>`).join('')}
        </div>`).join('');
    };

    const buildTaskTimeline = (r: any): string => {
      const groups = this.getGroupedTasks(r);
      if (!groups.length) return `<p style="color:#94a3b8;font-size:13px;text-align:center;padding:12px 0;">No tasks scheduled or logged during this period.</p>`;
      return groups.map(g => `
        <div style="border-left:2px solid #e2e8f0;margin-left:8px;padding-left:16px;padding-bottom:14px;position:relative;">
          <div style="font-size:11px;font-weight:700;color:#6366f1;margin-bottom:6px;position:relative;">
            <span style="position:absolute;left:-22px;top:2px;width:9px;height:9px;border-radius:50%;background:#6366f1;display:block;"></span>
            ${g.date === 'No Date' ? 'No Date Scheduled' : fmtDay(g.date)}
          </div>
          ${g.tasks.map((t: any) =>
            `<div style="display:flex;align-items:center;gap:6px;font-size:12px;margin-bottom:4px;">
              <span>${t.status === 'Completed' ? '✅' : '○'}</span>
              <span style="font-weight:600;color:#1e293b;">${t.title}</span>
              <span style="font-size:10px;color:#64748b;">(${t.priority || '—'} Priority)</span>
            </div>`).join('')}
        </div>`).join('');
    };

    const buildProjectTimeline = (r: any): string => {
      const groups = this.getGroupedProjects(r);
      if (!groups.length) return `<p style="color:#94a3b8;font-size:13px;text-align:center;padding:12px 0;">No project starts or updates recorded for this period.</p>`;
      return groups.map(g => `
        <div style="border-left:2px solid #e2e8f0;margin-left:8px;padding-left:16px;padding-bottom:14px;position:relative;">
          <div style="font-size:11px;font-weight:700;color:#6366f1;margin-bottom:6px;position:relative;">
            <span style="position:absolute;left:-22px;top:2px;width:9px;height:9px;border-radius:50%;background:#6366f1;display:block;"></span>
            ${fmtDay(g.date)}
          </div>
          ${g.projects.map((p: any) =>
            `<div style="display:flex;align-items:center;gap:6px;font-size:12px;margin-bottom:4px;">
              <span>📁</span>
              <span style="font-weight:600;color:#1e293b;">${p.title} — ${this.getProjectProgress(p)}% progress</span>
            </div>`).join('')}
        </div>`).join('');
    };

    // ── Shared card style ──
    const cardStyle = `background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:20px;`;
    const innerBoxStyle = `background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-top:14px;`;

    // ── Build report-specific content ──
    let periodLine = '';
    let reportTitle = '';
    let section1 = '';
    let section2 = '';
    let section3 = '';
    let section4 = '';
    let section5 = '';
    let section6 = '';
    let section7 = '';

    if (isWeekly && w) {
      reportTitle = '⚡ LevelUP — Weekly Performance Report';
      periodLine = `Period: ${w.weekLabel} (${fmt(w.weekStart as any, 'medium')} – ${fmt(w.weekEnd as any, 'medium')}) · User: ${w.userName} · Generated: ${fmt(w.generatedAt as any, 'medium')}`;
      const finalScore = this.getFinalScore(w);

      section1 = `<div style="${cardStyle}">
        ${sectionTitle('📋', '1. Executive Summary')}
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
          ${statCard('🔥', w.totalHabits, 'Habits Tracked')}
          ${statCard('📈', w.habitCompletionRate + '%', 'Habit Completion')}
          ${statCard('📝', w.totalTasks, 'Tasks Created')}
          ${statCard('✅', w.tasksCompleted, 'Tasks Completed')}
          ${statCard('⏳', w.tasksPending, 'Incomplete Tasks')}
          ${statCard('📁', w.activeProjectsList?.length || 0, 'Active Projects')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;${innerBoxStyle}">
          <div>
            <h4 style="font-size:11px;font-weight:800;text-transform:uppercase;color:#059669;letter-spacing:.05em;margin:0 0 8px 0;">🏆 Key Achievements</h4>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;">
              <li style="font-size:12px;padding-left:14px;position:relative;color:#1e293b;"><span style="position:absolute;left:0;color:#059669;">•</span>Earned +${(w.weekXP || 0).toLocaleString()} XP during this week.</li>
              <li style="font-size:12px;padding-left:14px;position:relative;color:#1e293b;"><span style="position:absolute;left:0;color:#059669;">•</span>Maintained a best streak of ${w.bestStreak} days.</li>
              ${w.habitCompletionRate >= 70 ? `<li style="font-size:12px;padding-left:14px;position:relative;color:#1e293b;"><span style="position:absolute;left:0;color:#059669;">•</span>High consistency with ${w.habitCompletionRate}% habit completion rate.</li>` : ''}
              ${w.tasksCompleted > 0 ? `<li style="font-size:12px;padding-left:14px;position:relative;color:#1e293b;"><span style="position:absolute;left:0;color:#059669;">•</span>Successfully completed ${w.tasksCompleted} work tasks.</li>` : ''}
            </ul>
          </div>
          <div>
            <h4 style="font-size:11px;font-weight:800;text-transform:uppercase;color:#dc2626;letter-spacing:.05em;margin:0 0 8px 0;">⚠️ Areas for Improvement</h4>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;">
              ${w.tasksOverdue > 0 ? `<li style="font-size:12px;padding-left:14px;position:relative;color:#1e293b;"><span style="position:absolute;left:0;color:#dc2626;">•</span>${w.tasksOverdue} tasks are overdue. Prioritize completing them.</li>` : ''}
              ${w.habitCompletionRate < 70 ? `<li style="font-size:12px;padding-left:14px;position:relative;color:#1e293b;"><span style="position:absolute;left:0;color:#dc2626;">•</span>Habit completion is at ${w.habitCompletionRate}%. Aim to log habits regularly.</li>` : ''}
              ${w.tasksOverdue === 0 && w.habitCompletionRate >= 70 ? `<li style="font-size:12px;padding-left:14px;position:relative;color:#1e293b;"><span style="position:absolute;left:0;color:#dc2626;">•</span>No critical issues! Keep up the excellent work.</li>` : ''}
            </ul>
          </div>
        </div>
      </div>`;

      section2 = `<div style="page-break-before:always;${cardStyle}">
        ${sectionTitle('⚡', '2. Habits Analysis')}
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;">
          ${subStatCard('Total Active Habits', w.totalHabits)}
          ${subStatCard('Avg Completion Rate', w.habitCompletionRate + '%', 'success')}
          ${subStatCard('Most Consistent', this.getBestHabit(w))}
          ${subStatCard('Least Consistent', this.getWorstHabit(w), 'danger')}
        </div>
        <div style="overflow:hidden;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:14px;">
          <table style="${tableStyles}">
            <thead><tr>
              <th style="${thStyle}">Habit Name</th><th style="${thStyle}">Frequency</th>
              <th style="${thStyle}">Successful</th><th style="${thStyle}">Missed</th>
              <th style="${thStyle}">Completion Rate</th><th style="${thStyle}">Status</th>
            </tr></thead>
            <tbody>
              ${(w.topHabits || []).length === 0
                ? `<tr><td colspan="6" style="${tdStyle}text-align:center;color:#94a3b8;">No habits logged during this period.</td></tr>`
                : (w.topHabits || []).map((h: any) =>
                  `<tr>
                    <td style="${tdStyle}font-weight:700;">${h.icon || '⭐'} ${h.title}</td>
                    <td style="${tdStyle}">${h.frequencyType || 'Daily'}</td>
                    <td style="${tdStyle}color:#059669;font-weight:700;">${h.completionsCount ?? 0}</td>
                    <td style="${tdStyle}color:#dc2626;font-weight:700;">${h.missedCount ?? 0}</td>
                    <td style="${tdStyle}">${progressBar(h.completionRate, h.color || '#a4e6ff')}</td>
                    <td style="${tdStyle}">${completionBadge(h.completionRate)}</td>
                  </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="${innerBoxStyle}">
          <h3 style="font-size:12px;font-weight:800;text-transform:uppercase;color:#64748b;margin:0 0 12px 0;">📅 Habit Logs Timeline</h3>
          ${buildHabitTimeline(w)}
        </div>
      </div>`;

      section3 = `<div style="page-break-before:always;${cardStyle}">
        ${sectionTitle('✅', '3. Tasks Analysis')}
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;">
          ${subStatCard('Total Tasks', w.totalTasks)}
          ${subStatCard('Completed', w.tasksCompleted, 'success')}
          ${subStatCard('Incomplete', w.tasksPending, 'warning')}
          ${subStatCard('Completion Rate', w.taskCompletionRate + '%', 'success')}
        </div>
        <h3 style="font-size:12px;font-weight:700;color:#374151;margin:0 0 8px 0;">✓ Completed Tasks</h3>
        <div style="overflow:hidden;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:14px;">
          <table style="${tableStyles}">
            <thead><tr>
              <th style="${thStyle}">Task Title</th><th style="${thStyle}">Due Date</th>
              <th style="${thStyle}">Completion Date</th><th style="${thStyle}">Priority</th><th style="${thStyle}">Status</th>
            </tr></thead>
            <tbody>
              ${(w.completedTasksList || []).length === 0
                ? `<tr><td colspan="5" style="${tdStyle}text-align:center;color:#94a3b8;">No completed tasks this week.</td></tr>`
                : (w.completedTasksList || []).map((t: any) =>
                  `<tr>
                    <td style="${tdStyle}font-weight:700;">${t.title}</td>
                    <td style="${tdStyle}">${fmt(t.dueDate)}</td>
                    <td style="${tdStyle}">${fmt(t.completedAt)}</td>
                    <td style="${tdStyle}">${priorityBadge(t.priority)}</td>
                    <td style="${tdStyle}">${statusBadge(true)}</td>
                  </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <h3 style="font-size:12px;font-weight:700;color:#374151;margin:14px 0 8px 0;">○ Incomplete Tasks</h3>
        <div style="overflow:hidden;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:14px;">
          <table style="${tableStyles}">
            <thead><tr>
              <th style="${thStyle}">Task Title</th><th style="${thStyle}">Due Date</th>
              <th style="${thStyle}">Priority</th><th style="${thStyle}">Status</th>
            </tr></thead>
            <tbody>
              ${(w.incompleteTasksList || []).length === 0
                ? `<tr><td colspan="4" style="${tdStyle}text-align:center;color:#94a3b8;">No incomplete tasks this week.</td></tr>`
                : (w.incompleteTasksList || []).map((t: any) =>
                  `<tr>
                    <td style="${tdStyle}font-weight:700;">${t.title}</td>
                    <td style="${tdStyle}">${fmt(t.dueDate)}</td>
                    <td style="${tdStyle}">${priorityBadge(t.priority)}</td>
                    <td style="${tdStyle}">${statusBadge(false)}</td>
                  </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="${innerBoxStyle}">
          <h3 style="font-size:12px;font-weight:800;text-transform:uppercase;color:#64748b;margin:0 0 12px 0;">📅 Tasks Timeline</h3>
          ${buildTaskTimeline(w)}
        </div>
      </div>`;

      section4 = `<div style="page-break-before:always;${cardStyle}">
        ${sectionTitle('📁', '4. Projects Analysis')}
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;">
          ${subStatCard('Total Projects', w.activeProjectsList?.length || 0)}
          ${subStatCard('Completed', (w.activeProjectsList || []).filter((p: any) => p.isCompleted).length, 'success')}
          ${subStatCard('Ongoing', (w.activeProjectsList || []).filter((p: any) => !p.isCompleted).length, 'warning')}
          ${subStatCard('Avg Progress', finalScore + '%', 'success')}
        </div>
        <div style="overflow:hidden;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:14px;">
          <table style="${tableStyles}">
            <thead><tr>
              <th style="${thStyle}">Project Name</th><th style="${thStyle}">Start Date</th>
              <th style="${thStyle}">Due Date</th><th style="${thStyle}">Progress</th>
              <th style="${thStyle}">Milestones</th><th style="${thStyle}">Status</th>
            </tr></thead>
            <tbody>
              ${(w.activeProjectsList || []).length === 0
                ? `<tr><td colspan="6" style="${tdStyle}text-align:center;color:#94a3b8;">No projects logged during this period.</td></tr>`
                : (w.activeProjectsList || []).map((p: any) => {
                    const pct = this.getProjectProgress(p);
                    return `<tr>
                      <td style="${tdStyle}font-weight:700;">${p.icon || '📁'} ${p.title}</td>
                      <td style="${tdStyle}">${fmt(p.createdAt)}</td>
                      <td style="${tdStyle}">${fmt(p.dueDate)}</td>
                      <td style="${tdStyle}">${progressBar(pct, p.color || '#6366f1')}</td>
                      <td style="${tdStyle}font-weight:700;">${p.completedTasks} done / ${(p.totalTasks - p.completedTasks)} remaining</td>
                      <td style="${tdStyle}">${statusBadge(p.isCompleted)}</td>
                    </tr>`;
                  }).join('')}
            </tbody>
          </table>
        </div>
        <div style="${innerBoxStyle}">
          <h3 style="font-size:12px;font-weight:800;text-transform:uppercase;color:#64748b;margin:0 0 12px 0;">📅 Projects Timeline</h3>
          ${buildProjectTimeline(w)}
        </div>
      </div>`;

      section5 = `<div style="${cardStyle}">
        ${sectionTitle('💡', '5. Productivity Insights')}
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
          ${['📅 Most Productive Day', '📅 Least Productive Day', '🔥 Best Habit', '⏳ Most Delayed Task', '⚡ Fastest Completed Task', '📈 Highest Progress Project', '⚠️ Project Requiring Attention'].map((head, i) => {
            const vals = [
              this.getMostProductiveDay(w), this.getLeastProductiveDay(w),
              this.getBestHabit(w), this.getMostDelayedTask(w),
              this.getFastestCompletedTask(w), this.getHighestProgressProject(w),
              this.getProjectRequiringAttention(w)
            ];
            return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">
              <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:.05em;margin-bottom:4px;">${head}</div>
              <div style="font-size:13px;font-weight:700;color:#0f172a;">${vals[i]}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;

      section6 = `<div style="${cardStyle}">
        ${sectionTitle('💡', '6. Recommendations')}
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;display:flex;flex-direction:column;gap:10px;">
          ${this.getRecommendations(w).map(rec =>
            `<div style="display:flex;align-items:flex-start;gap:8px;">
              <span style="color:#6366f1;font-size:14px;margin-top:1px;">⚡</span>
              <p style="margin:0;font-size:13px;line-height:1.5;color:#1e293b;">${rec}</p>
            </div>`).join('')}
        </div>
      </div>`;

      section7 = `<div style="${cardStyle}text-align:center;">
        ${sectionTitle('🏆', '7. Productivity Score')}
        <div style="width:160px;height:160px;margin:16px auto;border-radius:50%;background:linear-gradient(135deg,#ede9fe,#dbeafe);border:3px dashed #a5b4fc;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div style="font-size:32px;font-weight:900;color:#4f46e5;">${finalScore}/100</div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#6366f1;margin-top:4px;">Performance Level</div>
          <div style="font-size:12px;font-weight:800;color:#4338ca;">${this.getPerformanceLevel(finalScore)}</div>
        </div>
        <p style="max-width:480px;margin:0 auto;font-size:12px;color:#475569;line-height:1.6;">
          Calculated based on Habit completion (40%), Task completion (40%), and Project progress milestones (20%).
        </p>
      </div>`;

    } else if (!isWeekly && m) {
      // ── MONTHLY ──
      reportTitle = '⚡ LevelUP — Monthly Performance Report';
      periodLine = `Period: ${m.monthLabel} (${fmt(m.monthStart as any, 'medium')} – ${fmt(m.monthEnd as any, 'medium')}) · User: ${m.userName} · Generated: ${fmt(m.generatedAt as any, 'medium')}`;
      const finalScore = this.getFinalScore(m);

      section1 = `<div style="${cardStyle}">
        ${sectionTitle('📋', '1. Executive Summary')}
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
          ${statCard('🔥', m.activeHabits, 'Active Habits')}
          ${statCard('📈', m.habitCompletionRate + '%', 'Habit Completion')}
          ${statCard('✅', m.tasksCompleted, 'Tasks Completed')}
          ${statCard('⏳', m.incompleteTasksList?.length || 0, 'Incomplete Tasks')}
          ${statCard('📝', m.notesCreated, 'Notes Created')}
          ${statCard('📁', m.activeProjectsList?.length || 0, 'Active Projects')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;${innerBoxStyle}">
          <div>
            <h4 style="font-size:11px;font-weight:800;text-transform:uppercase;color:#059669;letter-spacing:.05em;margin:0 0 8px 0;">🏆 Key Achievements</h4>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;">
              <li style="font-size:12px;padding-left:14px;position:relative;color:#1e293b;"><span style="position:absolute;left:0;color:#059669;">•</span>Earned +${(m.monthXP || 0).toLocaleString()} XP during this month.</li>
              <li style="font-size:12px;padding-left:14px;position:relative;color:#1e293b;"><span style="position:absolute;left:0;color:#059669;">•</span>Maintained a best streak of ${m.bestStreak} days.</li>
              ${m.habitCompletionRate >= 70 ? `<li style="font-size:12px;padding-left:14px;position:relative;color:#1e293b;"><span style="position:absolute;left:0;color:#059669;">•</span>Maintained high consistency with ${m.habitCompletionRate}% habit completion rate.</li>` : ''}
              ${m.projectsCompleted > 0 ? `<li style="font-size:12px;padding-left:14px;position:relative;color:#1e293b;"><span style="position:absolute;left:0;color:#059669;">•</span>Successfully completed ${m.projectsCompleted} projects.</li>` : ''}
            </ul>
          </div>
          <div>
            <h4 style="font-size:11px;font-weight:800;text-transform:uppercase;color:#dc2626;letter-spacing:.05em;margin:0 0 8px 0;">⚠️ Areas for Improvement</h4>
            <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;">
              ${m.tasksOverdue > 0 ? `<li style="font-size:12px;padding-left:14px;position:relative;color:#1e293b;"><span style="position:absolute;left:0;color:#dc2626;">•</span>${m.tasksOverdue} tasks remained overdue. Prioritize completing them.</li>` : ''}
              ${m.habitCompletionRate < 70 ? `<li style="font-size:12px;padding-left:14px;position:relative;color:#1e293b;"><span style="position:absolute;left:0;color:#dc2626;">•</span>Habit completion is low (${m.habitCompletionRate}%). Try standardizing schedules.</li>` : ''}
              ${m.tasksOverdue === 0 && m.habitCompletionRate >= 70 ? `<li style="font-size:12px;padding-left:14px;position:relative;color:#1e293b;"><span style="position:absolute;left:0;color:#dc2626;">•</span>Keep up the wonderful pace! Ready for higher difficulty goals.</li>` : ''}
            </ul>
          </div>
        </div>
      </div>`;

      section2 = `<div style="page-break-before:always;${cardStyle}">
        ${sectionTitle('⚡', '2. Habits Analysis')}
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;">
          ${subStatCard('Total Active Habits', m.activeHabits)}
          ${subStatCard('Avg Completion Rate', m.habitCompletionRate + '%', 'success')}
          ${subStatCard('Most Consistent', this.getBestHabit(m))}
          ${subStatCard('Least Consistent', this.getWorstHabit(m), 'danger')}
        </div>
        <div style="overflow:hidden;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:14px;">
          <table style="${tableStyles}">
            <thead><tr>
              <th style="${thStyle}">Habit Name</th><th style="${thStyle}">Frequency</th>
              <th style="${thStyle}">Successful</th><th style="${thStyle}">Missed</th>
              <th style="${thStyle}">Completion Rate</th><th style="${thStyle}">Status</th>
            </tr></thead>
            <tbody>
              ${(m.topHabits || []).length === 0
                ? `<tr><td colspan="6" style="${tdStyle}text-align:center;color:#94a3b8;">No habits logged during this period.</td></tr>`
                : (m.topHabits || []).map((h: any) =>
                  `<tr>
                    <td style="${tdStyle}font-weight:700;">${h.icon || '⭐'} ${h.title}</td>
                    <td style="${tdStyle}">${h.frequencyType || 'Daily'}</td>
                    <td style="${tdStyle}color:#059669;font-weight:700;">${h.completionsCount ?? 0}</td>
                    <td style="${tdStyle}color:#dc2626;font-weight:700;">${h.missedCount ?? 0}</td>
                    <td style="${tdStyle}">${progressBar(h.completionRate, h.color || '#a4e6ff')}</td>
                    <td style="${tdStyle}">${completionBadge(h.completionRate)}</td>
                  </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="${innerBoxStyle}">
          <h3 style="font-size:12px;font-weight:800;text-transform:uppercase;color:#64748b;margin:0 0 12px 0;">📅 Habit Logs Timeline</h3>
          ${buildHabitTimeline(m)}
        </div>
      </div>`;

      section3 = `<div style="page-break-before:always;${cardStyle}">
        ${sectionTitle('✅', '3. Tasks Analysis')}
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;">
          ${subStatCard('Total Tasks', m.tasksCompleted + (m.incompleteTasksList?.length || 0))}
          ${subStatCard('Completed', m.tasksCompleted, 'success')}
          ${subStatCard('Incomplete', m.incompleteTasksList?.length || 0, 'warning')}
          ${subStatCard('Completion Rate', m.taskCompletionRate + '%', 'success')}
        </div>
        <h3 style="font-size:12px;font-weight:700;color:#374151;margin:0 0 8px 0;">✓ Completed Tasks</h3>
        <div style="overflow:hidden;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:14px;">
          <table style="${tableStyles}">
            <thead><tr>
              <th style="${thStyle}">Task Title</th><th style="${thStyle}">Due Date</th>
              <th style="${thStyle}">Completion Date</th><th style="${thStyle}">Priority</th><th style="${thStyle}">Status</th>
            </tr></thead>
            <tbody>
              ${(m.completedTasksList || []).length === 0
                ? `<tr><td colspan="5" style="${tdStyle}text-align:center;color:#94a3b8;">No completed tasks this month.</td></tr>`
                : (m.completedTasksList || []).map((t: any) =>
                  `<tr>
                    <td style="${tdStyle}font-weight:700;">${t.title}</td>
                    <td style="${tdStyle}">${fmt(t.dueDate)}</td>
                    <td style="${tdStyle}">${fmt(t.completedAt)}</td>
                    <td style="${tdStyle}">${priorityBadge(t.priority)}</td>
                    <td style="${tdStyle}">${statusBadge(true)}</td>
                  </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <h3 style="font-size:12px;font-weight:700;color:#374151;margin:14px 0 8px 0;">○ Incomplete Tasks</h3>
        <div style="overflow:hidden;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:14px;">
          <table style="${tableStyles}">
            <thead><tr>
              <th style="${thStyle}">Task Title</th><th style="${thStyle}">Due Date</th>
              <th style="${thStyle}">Priority</th><th style="${thStyle}">Status</th>
            </tr></thead>
            <tbody>
              ${(m.incompleteTasksList || []).length === 0
                ? `<tr><td colspan="4" style="${tdStyle}text-align:center;color:#94a3b8;">No incomplete tasks this month.</td></tr>`
                : (m.incompleteTasksList || []).map((t: any) =>
                  `<tr>
                    <td style="${tdStyle}font-weight:700;">${t.title}</td>
                    <td style="${tdStyle}">${fmt(t.dueDate)}</td>
                    <td style="${tdStyle}">${priorityBadge(t.priority)}</td>
                    <td style="${tdStyle}">${statusBadge(false)}</td>
                  </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="${innerBoxStyle}">
          <h3 style="font-size:12px;font-weight:800;text-transform:uppercase;color:#64748b;margin:0 0 12px 0;">📅 Tasks Timeline</h3>
          ${buildTaskTimeline(m)}
        </div>
      </div>`;

      section4 = `<div style="page-break-before:always;${cardStyle}">
        ${sectionTitle('📁', '4. Projects Analysis')}
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;">
          ${subStatCard('Total Projects', m.activeProjectsList?.length || 0)}
          ${subStatCard('Completed', (m.activeProjectsList || []).filter((p: any) => p.isCompleted).length, 'success')}
          ${subStatCard('Ongoing', (m.activeProjectsList || []).filter((p: any) => !p.isCompleted).length, 'warning')}
          ${subStatCard('Avg Progress', finalScore + '%', 'success')}
        </div>
        <div style="overflow:hidden;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:14px;">
          <table style="${tableStyles}">
            <thead><tr>
              <th style="${thStyle}">Project Name</th><th style="${thStyle}">Start Date</th>
              <th style="${thStyle}">Due Date</th><th style="${thStyle}">Progress</th>
              <th style="${thStyle}">Milestones</th><th style="${thStyle}">Status</th>
            </tr></thead>
            <tbody>
              ${(m.activeProjectsList || []).length === 0
                ? `<tr><td colspan="6" style="${tdStyle}text-align:center;color:#94a3b8;">No projects logged during this period.</td></tr>`
                : (m.activeProjectsList || []).map((p: any) => {
                    const pct = this.getProjectProgress(p);
                    return `<tr>
                      <td style="${tdStyle}font-weight:700;">${p.icon || '📁'} ${p.title}</td>
                      <td style="${tdStyle}">${fmt(p.createdAt)}</td>
                      <td style="${tdStyle}">${fmt(p.dueDate)}</td>
                      <td style="${tdStyle}">${progressBar(pct, p.color || '#6366f1')}</td>
                      <td style="${tdStyle}font-weight:700;">${p.completedTasks} done / ${(p.totalTasks - p.completedTasks)} remaining</td>
                      <td style="${tdStyle}">${statusBadge(p.isCompleted)}</td>
                    </tr>`;
                  }).join('')}
            </tbody>
          </table>
        </div>
        <div style="${innerBoxStyle}">
          <h3 style="font-size:12px;font-weight:800;text-transform:uppercase;color:#64748b;margin:0 0 12px 0;">📅 Projects Timeline</h3>
          ${buildProjectTimeline(m)}
        </div>
      </div>`;

      section5 = `<div style="${cardStyle}">
        ${sectionTitle('💡', '5. Productivity Insights')}
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
          ${['📅 Most Productive Day', '📅 Least Productive Day', '🔥 Best Habit', '⏳ Most Delayed Task', '⚡ Fastest Completed Task', '📈 Highest Progress Project', '⚠️ Project Requiring Attention'].map((head, i) => {
            const vals = [
              this.getMostProductiveDay(m), this.getLeastProductiveDay(m),
              this.getBestHabit(m), this.getMostDelayedTask(m),
              this.getFastestCompletedTask(m), this.getHighestProgressProject(m),
              this.getProjectRequiringAttention(m)
            ];
            return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">
              <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:.05em;margin-bottom:4px;">${head}</div>
              <div style="font-size:13px;font-weight:700;color:#0f172a;">${vals[i]}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;

      section6 = `<div style="${cardStyle}">
        ${sectionTitle('💡', '6. Recommendations')}
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;display:flex;flex-direction:column;gap:10px;">
          ${this.getRecommendations(m).map(rec =>
            `<div style="display:flex;align-items:flex-start;gap:8px;">
              <span style="color:#6366f1;font-size:14px;margin-top:1px;">⚡</span>
              <p style="margin:0;font-size:13px;line-height:1.5;color:#1e293b;">${rec}</p>
            </div>`).join('')}
        </div>
      </div>`;

      section7 = `<div style="${cardStyle}text-align:center;">
        ${sectionTitle('🏆', '7. Productivity Score')}
        <div style="width:160px;height:160px;margin:16px auto;border-radius:50%;background:linear-gradient(135deg,#ede9fe,#dbeafe);border:3px dashed #a5b4fc;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div style="font-size:32px;font-weight:900;color:#4f46e5;">${finalScore}/100</div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#6366f1;margin-top:4px;">Performance Level</div>
          <div style="font-size:12px;font-weight:800;color:#4338ca;">${this.getPerformanceLevel(finalScore)}</div>
        </div>
        <p style="max-width:480px;margin:0 auto;font-size:12px;color:#475569;line-height:1.6;">
          Calculated based on Habit completion (40%), Task completion (40%), and Project progress milestones (20%).
        </p>
      </div>`;
    }

    // ── Assemble full HTML document ──
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${reportTitle}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 15mm 15mm 15mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #ffffff;
      color: #1e293b;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .report-wrapper { max-width: 100%; padding: 0; }
    .report-page-header {
      text-align: center;
      border-bottom: 2.5px solid #6366f1;
      padding-bottom: 14px;
      margin-bottom: 24px;
    }
    .report-page-header h1 {
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
      margin: 0 0 4px 0;
    }
    .report-page-header .period {
      font-size: 11px;
      color: #475569;
      margin: 0;
    }
    .report-footer {
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      margin-top: 24px;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
    }
    @media print {
      body { background: #ffffff !important; }
    }
  </style>
</head>
<body>
  <div class="report-wrapper">
    <div class="report-page-header">
      <h1>${reportTitle}</h1>
      <p class="period">${periodLine}</p>
    </div>
    ${section1}${section2}${section3}${section4}${section5}${section6}${section7}
    <div class="report-footer">
      LevelUP productivity assessment report — Generated automatically. All data is personal and confidential.
    </div>
  </div>
  <script>
    window.onload = function() {
      window.print();
      window.onafterprint = function() { window.close(); };
    };
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  }

  // ── Grouping & Insights Helpers ──────────────────
  getGroupedHabits(report: any): { date: string, logs: any[] }[] {
    if (!report || !report.habitLogs) return [];
    const groups: Record<string, any[]> = {};
    report.habitLogs.forEach((log: any) => {
      const dStr = log.date.substring(0, 10);
      if (!groups[dStr]) groups[dStr] = [];
      groups[dStr].push(log);
    });
    return Object.keys(groups).sort().map(date => ({
      date,
      logs: groups[date]
    }));
  }

  getGroupedTasks(report: any): { date: string, tasks: any[] }[] {
    if (!report) return [];
    const groups: Record<string, any[]> = {};
    if (report.completedTasksList) {
      report.completedTasksList.forEach((t: any) => {
        const date = t.completedAt ? t.completedAt.substring(0, 10) : 'No Date';
        if (!groups[date]) groups[date] = [];
        groups[date].push(t);
      });
    }
    if (report.incompleteTasksList) {
      report.incompleteTasksList.forEach((t: any) => {
        const date = t.dueDate ? t.dueDate.substring(0, 10) : 'No Date';
        if (!groups[date]) groups[date] = [];
        groups[date].push(t);
      });
    }
    return Object.keys(groups).sort().map(date => ({
      date,
      tasks: groups[date]
    }));
  }

  getGroupedProjects(report: any): { date: string, projects: any[] }[] {
    if (!report || !report.activeProjectsList) return [];
    const groups: Record<string, any[]> = {};
    report.activeProjectsList.forEach((p: any) => {
      const date = p.createdAt ? p.createdAt.substring(0, 10) : 'No Date';
      if (!groups[date]) groups[date] = [];
      groups[date].push(p);
    });
    return Object.keys(groups).sort().map(date => ({
      date,
      projects: groups[date]
    }));
  }

  getProjectProgress(p: any): number {
    if (!p || !p.totalTasks) return 0;
    return Math.round((p.completedTasks / p.totalTasks) * 100);
  }

  getMostProductiveDay(report: any): string {
    if (!report || !report.dailyScores || report.dailyScores.length === 0) return 'N/A';
    const sorted = [...report.dailyScores].sort((a, b) => b.score - a.score);
    return sorted[0].day + ' (' + sorted[0].score + '%)';
  }

  getLeastProductiveDay(report: any): string {
    if (!report || !report.dailyScores || report.dailyScores.length === 0) return 'N/A';
    const sorted = [...report.dailyScores].sort((a, b) => a.score - b.score);
    return sorted[0].day + ' (' + sorted[0].score + '%)';
  }

  getBestHabit(report: any): string {
    if (!report || !report.topHabits || report.topHabits.length === 0) return 'N/A';
    const sorted = [...report.topHabits].sort((a, b) => b.completionRate - a.completionRate);
    return sorted[0].title + ' (' + sorted[0].completionRate + '%)';
  }

  getWorstHabit(report: any): string {
    if (!report || !report.topHabits || report.topHabits.length === 0) return 'N/A';
    const sorted = [...report.topHabits].sort((a, b) => a.completionRate - b.completionRate);
    return sorted[0].title + ' (' + sorted[0].completionRate + '%)';
  }

  getMostDelayedTask(report: any): string {
    if (!report || !report.incompleteTasksList || report.incompleteTasksList.length === 0) return 'N/A';
    const high = report.incompleteTasksList.find((t: any) => t.priority === 'High');
    if (high) return high.title;
    return report.incompleteTasksList[0].title;
  }

  getFastestCompletedTask(report: any): string {
    if (!report || !report.completedTasksList || report.completedTasksList.length === 0) return 'N/A';
    return report.completedTasksList[0].title;
  }

  getHighestProgressProject(report: any): string {
    if (!report || !report.activeProjectsList || report.activeProjectsList.length === 0) return 'N/A';
    const sorted = [...report.activeProjectsList].sort((a, b) => {
      const rateA = a.totalTasks > 0 ? (a.completedTasks / a.totalTasks) : 0;
      const rateB = b.totalTasks > 0 ? (b.completedTasks / b.totalTasks) : 0;
      return rateB - rateA;
    });
    const best = sorted[0];
    const pct = best.totalTasks > 0 ? Math.round((best.completedTasks / best.totalTasks) * 100) : 0;
    return best.title + ' (' + pct + '%)';
  }

  getProjectRequiringAttention(report: any): string {
    if (!report || !report.activeProjectsList || report.activeProjectsList.length === 0) return 'N/A';
    const sorted = [...report.activeProjectsList].sort((a, b) => {
      const rateA = a.totalTasks > 0 ? (a.completedTasks / a.totalTasks) : 0;
      const rateB = b.totalTasks > 0 ? (b.completedTasks / b.totalTasks) : 0;
      return rateA - rateB;
    });
    const worst = sorted[0];
    const pct = worst.totalTasks > 0 ? Math.round((worst.completedTasks / worst.totalTasks) * 100) : 0;
    return worst.title + ' (' + pct + '%)';
  }

  getRecommendations(report: any): string[] {
    if (!report) return [];
    const recs: string[] = [];
    if (report.habitCompletionRate < 60) {
      recs.push('Improve consistency in habits. Try setting daily reminders to boost completion rates.');
    } else {
      recs.push('Excellent job keeping up with your habits! Keep maintaining this streak.');
    }
    if (report.topHabits) {
      report.topHabits.forEach((h: any) => {
        if (h.completionRate < 60) {
          recs.push(`Focus on the "${h.title}" habit which is currently at a ${h.completionRate}% completion rate.`);
        }
      });
    }
    if (report.tasksOverdue > 0) {
      recs.push(`Prioritize completing your ${report.tasksOverdue} overdue tasks.`);
    }
    if (report.taskCompletionRate < 70) {
      recs.push('Try planning smaller tasks daily to help improve your task completion rate.');
    }
    if (report.activeProjectsList) {
      report.activeProjectsList.forEach((p: any) => {
        const progress = p.totalTasks > 0 ? (p.completedTasks / p.totalTasks * 100) : 0;
        if (progress < 40 && !p.isCompleted) {
          recs.push(`Break down the "${p.title}" project into smaller, more manageable milestones.`);
        }
      });
    }
    if (recs.length === 0) {
      recs.push('You are performing exceptionally well! Keep up the balanced routine.');
    }
    return recs;
  }

  getFinalScore(report: any): number {
    if (!report) return 0;
    const hRate = report.habitCompletionRate ?? 0;
    const tRate = report.taskCompletionRate ?? 0;
    let pRate = 0;
    if (report.activeProjectsList && report.activeProjectsList.length > 0) {
      const sum = report.activeProjectsList.reduce((acc: number, p: any) => {
        return acc + (p.totalTasks > 0 ? (p.completedTasks / p.totalTasks * 100) : 0);
      }, 0);
      pRate = Math.round(sum / report.activeProjectsList.length);
    }
    return Math.round((hRate * 0.4) + (tRate * 0.4) + (pRate * 0.2));
  }

  getPerformanceLevel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
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
