
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TaskService }  from '../../../../core/services/task.service';
import { UpdateTaskDto, TaskPriority } from '../../../../shared/models/task.model';

@Component({
  selector: 'app-edit-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-task.html',
  styleUrl: './edit-task.scss'
})

export class EditTask implements OnInit {

  taskId: number = 0;

  formData: UpdateTaskDto = {
    title: '',
    description: '',
    priority: TaskPriority.Medium,
    dueDate: '',
    estimatedMinutes: 30
  };

  isLoadingTask = true;
  isSaving      = false;
  errorMessage  = '';
  minDate       = '';

  TaskPriority = TaskPriority;

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.minDate = `${yyyy}-${mm}-${dd}`;

    const id = +this.route.snapshot.paramMap.get('id')!;

    this.taskId = id;
    this.loadCurrentTask(id);
  }

  loadCurrentTask(id: number): void {
    this.isLoadingTask = true;
    this.cdr.detectChanges();
    this.taskService.getTaskById(id).subscribe({

      next: (task) => {
        this.formData = {
          title: task.title,
          description: task.description ?? '',
          priority: task.priority,
          dueDate: task.dueDate ?? '',
          estimatedMinutes: task.estimatedMinutes
        };

        this.isLoadingTask = false;
        this.cdr.detectChanges();

      },
      error: () => {
        this.errorMessage  = 'task not found';
        this.toastr.error(this.errorMessage, 'Error');
        this.isLoadingTask = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (!this.formData.title.trim()) {

      this.errorMessage = 'title is required';
      this.toastr.warning(this.errorMessage, 'Warning');
      this.cdr.detectChanges();

      return;
    }

    this.isSaving     = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.taskService.updateTask(this.taskId, this.formData).subscribe({
      next: () => {

        this.toastr.success('Task updated successfully!', 'Success');
        this.router.navigate(['/tasks', this.taskId]);

      },
      error: (err) => {

        this.errorMessage = err.error?.message ?? 'Failed to save. Please try again';
        this.toastr.error(this.errorMessage, 'Error');
        this.isSaving = false;
        this.cdr.detectChanges();

      }
    });
  }

  onCancel(): void {

    this.router.navigate(['/tasks', this.taskId]);
    
  }
}
