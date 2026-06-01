import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../../../core/services/project.service';
import { CreateProjectDto } from '../../../../shared/models/project.model';

@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-project.html',
  styleUrl: './create-project.scss',
})
export class CreateProject {

  private projectService = inject(ProjectService);
  private router         = inject(Router);
  private cdr            = inject(ChangeDetectorRef);

  dto: CreateProjectDto = {
    title: '',
    description: '',
    color: '#a4e6ff',
    icon: '📁',
    dueDate: null
  };

  dueDateString: string = '';

  isSubmitting = false;
  errorMessage = '';

  readonly colorOptions = [
    '#a4e6ff', // Ice Blue
    '#6ee7b7', // Mint
    '#ffad82', // Coral
    '#c084fc', // Lavender
    '#f472b6', // Pink
    '#fbbf24', // Amber
  ];

  readonly iconOptions = [
    '📁', '🗂', '💻', '🎨', '✍️', '🏠', '🏋️', '🎵', '✈️', '🎓', '💼', '🚀', '🌟'
  ];

  submit(): void {
    if (!this.dto.title.trim()) {
      this.errorMessage = 'Project title is required.';
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.dto.dueDate = this.dueDateString ? new Date(this.dueDateString).toISOString() : null;
    this.cdr.detectChanges();

    this.projectService.create(this.dto).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to create project.';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
