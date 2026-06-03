import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule }               from '@angular/common';
import { FormsModule }                from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ToastrService }              from 'ngx-toastr';
import { ProjectService }             from '../../../../core/services/project.service';
import { ProjectDetail as ModelProjectDetail, ProjectTask } from '../../../../shared/models/project.model';

type KanbanStatus = 'Todo' | 'InProgress' | 'Done';

@Component({
  selector:    'app-project-detail',
  standalone:  true,
  imports:     [CommonModule, FormsModule, RouterLink],
  templateUrl: './project-detail.html',
  styleUrl:    './project-detail.scss',
})
export class ProjectDetail implements OnInit {

  private projectService = inject(ProjectService);
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);
  private toastr         = inject(ToastrService);
  private cdr            = inject(ChangeDetectorRef);

  project:      ModelProjectDetail | null = null;
  isLoading                          = false;
  errorMessage                       = '';

  // New task form
  showAddForm   = false;
  newTaskTitle  = '';
  newTaskStatus: KanbanStatus = 'Todo';
  addingTask    = false;

  readonly columns: { status: KanbanStatus; label: string; icon: string }[] = [
    { status: 'Todo',       label: 'To Do',      icon: '⬜' },
    { status: 'InProgress', label: 'In Progress', icon: '🔄' },
    { status: 'Done',       label: 'Done',        icon: '✅' },
  ];

  get projectId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  getTasksByStatus(status: KanbanStatus): ProjectTask[] {
    return this.project?.tasks.filter(t => t.status === status) ?? [];
  }

  get progressColor(): string {
    const p = this.project?.progressPercent ?? 0;
    if (p >= 100) return '#6ee7b7';
    if (p >= 60)  return '#a4e6ff';
    if (p >= 30)  return '#ffad82';
    return '#64748b';
  }

  ngOnInit() { this.load(); }

  load(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.projectService.getById(this.projectId).subscribe({
      next: (data) => {
        this.project = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load project details.';
        this.toastr.error(this.errorMessage, 'Error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleProjectComplete(): void {
    if (!this.project) return;
    this.projectService.toggleComplete(this.project.id).subscribe({
      next: (updated) => {
        this.project!.isCompleted = updated.isCompleted;
        this.toastr.success(updated.isCompleted ? 'Project completed! +50 XP' : 'Project marked as incomplete', 'Success');
        this.cdr.detectChanges();
      },
      error: () => this.toastr.error('Failed to update project status.', 'Error')
    });
  }

  addTask(): void {
    if (!this.newTaskTitle.trim() || !this.project) return;
    this.addingTask = true;
    this.cdr.detectChanges();

    this.projectService.addTask(this.project.id, {
      title: this.newTaskTitle.trim(),
      description: '',
      status: this.newTaskStatus
    }).subscribe({
      next: (task) => {
        this.project!.tasks.push(task);
        this.recalcProgress();
        this.newTaskTitle = '';
        this.showAddForm = false;
        this.addingTask = false;
        this.toastr.success('Task added to project Kanban board!', 'Success');
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('Failed to add task.', 'Error');
        this.addingTask = false;
        this.cdr.detectChanges();
      }
    });
  }

  moveTask(task: ProjectTask, nextStatus: KanbanStatus): void {
    if (!this.project || task.status === nextStatus) return;

    this.projectService.updateTaskStatus(this.project.id, task.id, nextStatus).subscribe({
      next: (updated) => {
        task.status = updated.status;
        this.recalcProgress();
        this.toastr.success(`Task moved to ${nextStatus}`, 'Success');
        this.cdr.detectChanges();
      },
      error: () => this.toastr.error('Failed to move task.', 'Error')
    });
  }

  deleteTask(taskId: number): void {
    if (!this.project) return;

    this.projectService.deleteTask(this.project.id, taskId).subscribe({
      next: () => {
        this.project!.tasks = this.project!.tasks.filter(t => t.id !== taskId);
        this.recalcProgress();
        this.toastr.success('Task deleted successfully', 'Success');
        this.cdr.detectChanges();
      },
      error: () => this.toastr.error('Failed to delete task.', 'Error')
    });
  }

  private recalcProgress(): void {
    if (!this.project) return;
    const total = this.project.tasks.length;
    const completed = this.project.tasks.filter(t => t.status === 'Done').length;
    this.project.totalTasks = total;
    this.project.completedTasks = completed;
    this.project.progressPercent = total > 0 ? Math.round(completed / total * 100) : 0;
  }

  formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}
