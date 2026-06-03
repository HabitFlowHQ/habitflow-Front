import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../../../core/services/project.service';
import { UpdateProjectDto } from '../../../../shared/models/project.model';

@Component({
  selector: 'app-edit-project',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-project.html',
  styleUrl: './edit-project.scss',
})
export class EditProject implements OnInit {

  private projectService = inject(ProjectService);
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private toastr         = inject(ToastrService);
  private cdr            = inject(ChangeDetectorRef);

  projectId!: number;

  dto: UpdateProjectDto = {
    title: '',
    description: '',
    color: '#a4e6ff',
    icon: '📁',
    dueDate: null
  };

  dueDateString: string = '';

  isLoading    = false;
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

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.errorMessage = 'Project ID not found in URL';
      this.toastr.error(this.errorMessage, 'Error');
      this.cdr.detectChanges();
      return;
    }
    this.projectId = +idParam;
    this.loadProject();
  }

  loadProject(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.projectService.getById(this.projectId).subscribe({
      next: (project) => {
        this.dto = {
          title:       project.title,
          description: project.description || '',
          color:       project.color && project.color.startsWith('#') ? project.color : '#a4e6ff',
          icon:        project.icon || '📁',
          dueDate:     project.dueDate
        };
        if (project.dueDate) {
          this.dueDateString = new Date(project.dueDate).toISOString().substring(0, 10);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load project for editing.';
        this.toastr.error(this.errorMessage, 'Error');
        this.isLoading    = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  submit(): void {
    if (!this.dto.title.trim()) {
      this.errorMessage = 'Project title is required.';
      this.toastr.warning(this.errorMessage, 'Warning');
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.dto.dueDate = this.dueDateString ? new Date(this.dueDateString).toISOString() : null;
    this.cdr.detectChanges();

    this.projectService.update(this.projectId, this.dto).subscribe({
      next: () => {
        this.toastr.success('Project updated successfully!', 'Success');
        this.router.navigate(['/projects', this.projectId]);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to update project.';
        this.toastr.error(this.errorMessage, 'Error');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
