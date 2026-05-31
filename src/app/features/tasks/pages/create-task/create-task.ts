
import { Component, OnInit, ChangeDetectorRef }  from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { Router }       from '@angular/router';

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
      this.cdr.detectChanges();
      return;
    }

    if (this.formData.estimatedMinutes <= 0) {
      this.errorMessage = 'Estimated time must be a positive number';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.taskService.createTask(this.formData).subscribe({
      next: (createdTask) => {
        console.log('Task created:', createdTask);
        this.router.navigate(['/tasks']);
      },

      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to create task. Please try again.';
        this.isLoading    = false;
        this.cdr.detectChanges();
      }
    });
  }


  onCancel(): void {
    this.router.navigate(['/tasks']);
  }
}
