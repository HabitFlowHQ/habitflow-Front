import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { RouterLink }                from '@angular/router';
import { ToastrService }             from 'ngx-toastr';
import { ProjectService }            from '../../../../core/services/project.service';
import { Project }                   from '../../../../shared/models/project.model';

@Component({
  selector:    'app-project-list',
  standalone:  true,
  imports:     [CommonModule, RouterLink],
  templateUrl: './project-list.html',
  styleUrl:    './project-list.scss',
})
export class ProjectList implements OnInit {

  private projectService = inject(ProjectService);
  private toastr         = inject(ToastrService);
  private cdr            = inject(ChangeDetectorRef);

  projects:    Project[] = [];
  isLoading          = false;
  errorMessage       = '';

  ngOnInit() { this.load(); }

  load(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.projectService.getAll().subscribe({
      next:  (data) => {
        this.projects = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: ()     => {
        this.errorMessage = 'Failed to load projects.';
        this.toastr.error(this.errorMessage, 'Error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  delete(id: number): void {
    this.projectService.delete(id).subscribe({
      next:  () => {
        this.toastr.success('Project and tasks deleted successfully!', 'Success');
        this.projects = this.projects.filter(p => p.id !== id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to delete project.';
        this.toastr.error(this.errorMessage, 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  getProgressColor(percent: number): string {
    if (percent >= 100) return '#6ee7b7'; // Green
    if (percent >= 60)  return '#a4e6ff'; // Blue
    if (percent >= 30)  return '#ffad82'; // Orange
    return '#64748b';
  }

  formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  isOverdue(p: Project): boolean {
    return !p.isCompleted && !!p.dueDate &&
           new Date(p.dueDate) < new Date();
  }
}
