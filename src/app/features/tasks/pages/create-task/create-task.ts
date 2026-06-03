
import { Component, OnInit, ChangeDetectorRef }  from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { Router }       from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TaskService }              from '../../../../core/services/task.service';
import { CreateTaskDto, TaskPriority } from '../../../../shared/models/task.model';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './create-task.html',
  styleUrl: './create-task.scss'
})
export class CreateTask implements OnInit {

  formData: CreateTaskDto = {
    title: '',
    description: '',
    priority: TaskPriority.Medium,
    dueDate: '',
    estimatedMinutes: 30
  };

  isLoading: boolean = false;
  errorMessage: string = '';
  minDate: string = '';

  TaskPriority = TaskPriority;

  constructor(
    private taskService: TaskService,
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
    this.formData.dueDate = this.minDate;
  }

  onSubmit(): void {
    if (!this.formData.title.trim()) {
      this.errorMessage = 'Task title is required';
      this.toastr.warning(this.errorMessage, 'Warning');
      this.cdr.detectChanges();
      return;
    }

    if (this.formData.estimatedMinutes <= 0) {
      this.errorMessage = 'Estimated time must be a positive number';
      this.toastr.warning(this.errorMessage, 'Warning');
      this.cdr.detectChanges();
      return;
    }

    if (this.formData.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(this.formData.dueDate);
      due.setHours(0, 0, 0, 0);
      if (due.getTime() < today.getTime()) {
        this.errorMessage = 'Due date cannot be in the past.';
        this.toastr.error(this.errorMessage, 'Error');
        this.cdr.detectChanges();
        return;
      }
    }

    this.isLoading    = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.taskService.createTask(this.formData).subscribe({
      next: (createdTask) => {
        console.log('Task created:', createdTask);
        this.toastr.success('Task created successfully!', 'Success');
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to create task. Please try again.';
        this.toastr.error(this.errorMessage, 'Error');
        this.isLoading    = false;
        this.cdr.detectChanges();
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }
}
