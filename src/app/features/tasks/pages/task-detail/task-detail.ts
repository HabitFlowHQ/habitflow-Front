import { Component, OnInit }  from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TaskService } from '../../../../core/services/task.service';
import {
  TaskDetails,
  TaskStatus,
  TaskPriority,
  TaskActionType
} from '../../../../shared/models/task.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.scss'
})
export class TaskDetail implements OnInit {

  task: TaskDetails | null = null;
  isLoading   = false;
  errorMessage = '';

  actualMinutes = 0;
  showCompleteForm = false;

  TaskStatus     = TaskStatus;
  TaskPriority   = TaskPriority;
  TaskActionType = TaskActionType;

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    const idParam = this.route.snapshot.paramMap.get('id');


    if (!idParam) {
      this.errorMessage = 'task id not provided in URL';
      return;
    }


    const id = +idParam;

    this.loadTask(id);
  }


  loadTask(id: number): void {
    this.isLoading = true;

    this.taskService.getTaskById(id).subscribe({
      next: (data: TaskDetails) => {
        this.task      = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.status === 404
          ? 'Task not found'
          : 'Failed to load task details';
        this.isLoading = false;
      }
    });
  }


  startTask(): void {
    if (!this.task) return;

    this.taskService.startTask(this.task.id).subscribe({
      next: (res) => {
        console.log(res.message);
        this.task!.status = TaskStatus.InProgress;
      },
      error: (err) => console.error(err)
    });
  }


  completeTask(): void {
    if (!this.task) return;

    if (this.actualMinutes <= 0) {
      alert('Please enter a valid number of minutes spent on the task');
      return;
    }

    this.taskService.completeTask(this.task.id, {
      actualMinutes: this.actualMinutes
    }).subscribe({
      next: (res) => {
        console.log(res.message);
        this.task!.status         = TaskStatus.Completed;
        this.task!.actualMinutes  = this.actualMinutes;
        this.task!.completedAt    = new Date().toISOString();
        this.showCompleteForm     = false;
      },
      error: (err) => console.error(err)
    });
  }

  ─
  deleteTask(): void {
    if (!this.task) return;
    if (!confirm('Are you sure you want to delete this task?')) return;

    this.taskService.deleteTask(this.task.id).subscribe({
      next: () => this.router.navigate(['/tasks']),
      error: (err) => console.error(err)
    });
  }



}
