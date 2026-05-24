
import { Component }  from '@angular/core';
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
export class CreateTask {


  formData: CreateTaskDto = {
    title: '',
    description: '',
    priority: TaskPriority.Medium,
    dueDate: '',
    estimatedMinutes: 30
  };

  isLoading: boolean = false;
  errorMessage: string = '';

  TaskPriority = TaskPriority;


  constructor(
    private taskService: TaskService,
    private router: Router
  ) {}


  onSubmit(): void {

    if (!this.formData.title.trim()) {
      this.errorMessage = 'Task title is required';
      return;
    }

    if (this.formData.estimatedMinutes <= 0) {
      this.errorMessage = 'Estimated time must be a positive number';
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    this.taskService.createTask(this.formData).subscribe({
      next: (createdTask) => {
        console.log('Task created:', createdTask);
        this.router.navigate(['/tasks']);
      },

      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to create task. Please try again.';
        this.isLoading    = false;
      }
    });
  }


  onCancel(): void {
    this.router.navigate(['/tasks']);
  }
}
