import { Component, OnInit, ChangeDetectorRef }  from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
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
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('[TaskDetail] Component OnInit initialized');

    this.route.paramMap.subscribe({
      next: (params) => {
        const idParam = params.get('id');
        console.log('[TaskDetail] Route parameter "id" changed:', idParam);
        if (!idParam) {
          this.errorMessage = 'task id not provided in URL';
          this.toastr.error(this.errorMessage, 'Error');
          this.cdr.detectChanges();
          return;
        }

        const id = +idParam;

        if (isNaN(id)) {
          this.errorMessage = 'Invalid task ID provided';
          this.toastr.error(this.errorMessage, 'Error');
          this.cdr.detectChanges();
          return;
        }

        this.loadTask(id);

      },
      error: (err) => {
        console.error('[TaskDetail] Error reading route params:', err);
        this.errorMessage = 'Failed to parse route parameters';
        this.toastr.error(this.errorMessage, 'Error');
        this.cdr.detectChanges();
      }

    });
  }

  loadTask(id: number): void {
    console.log(`[TaskDetail] Sending API request to load task ID: ${id}`);
    this.isLoading = true;
    this.errorMessage = '';
    this.task = null;
    this.cdr.detectChanges();

    this.taskService.getTaskById(id).subscribe({

      next: (data: TaskDetails) => {
        console.log('[TaskDetail] Successfully loaded task details:', data);
        this.task      = data;
        this.isLoading = false;
        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error('[TaskDetail] API error occurred:', err);
        this.errorMessage = err.status === 404
          ? 'Task not found'
          : 'Failed to load task details (' + (err.message || 'connection error') + ')';
        this.toastr.error(this.errorMessage, 'Error');
        this.isLoading = false;
        this.cdr.detectChanges();
        
      }
    });
  }

  startTask(): void {
    if (!this.task) return;

    this.taskService.startTask(this.task.id).subscribe({
      next: (res) => {
        console.log(res.message);
        this.task!.status = TaskStatus.InProgress;
        this.toastr.success('Task started! Work hard!', 'Success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to start task.', 'Error');
      }
    });
  }

  completeTask(): void {
    if (!this.task) return;

    if (this.actualMinutes <= 0) {
      this.toastr.warning('Please enter a valid number of minutes spent on the task', 'Warning');
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
        this.toastr.success('Task completed successfully! XP gained!', 'Success');
        this.router.navigate(['/tasks']);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to complete task.', 'Error');
      }
    });
  }

  deleteTask(): void {
    if (!this.task) return;

    this.taskService.deleteTask(this.task.id).subscribe({
      next: () => {
        this.toastr.success('Task deleted successfully', 'Success');
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to delete task.', 'Error');
      }
    });
  }

  getActionLabel(actionType: number): string {
    switch (actionType) {
      case this.TaskActionType.Created:   return '✅ Created';
      case this.TaskActionType.Updated:   return '✏️ Updated';
      case this.TaskActionType.Started:   return '▶️ Started';
      case this.TaskActionType.Completed: return '🏁 Completed';
      default: return 'Unknown';
    }
  }
}
