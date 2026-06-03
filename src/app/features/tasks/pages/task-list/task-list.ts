import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { Subscription }  from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TaskService }   from '../../../../core/services/task.service';
import { FormsModule }    from '@angular/forms';
import { Task, TaskStatus, TaskPriority } from '../../../../shared/models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.scss']
})
export class TaskList implements OnInit, OnDestroy {

  tasks: Task[]      = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  searchQuery: string = '';

  private tasksSub?: Subscription;

  TaskStatus   = TaskStatus;
  TaskPriority = TaskPriority;

  getTodayLocalStr(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get filteredTasks(): Task[] {
    const todayStr = this.getTodayLocalStr();
    let list = this.tasks;

    // Show tasks due today or with no due date (strictly filter out future tasks like tomorrow's)
    list = list.filter(t => {
      if (!t.dueDate) return true;
      return t.dueDate.substring(0, 10) === todayStr;
    });

    if (!this.searchQuery.trim()) {
      return list;
    }
    const q = this.searchQuery.toLowerCase();
    return list.filter(t => 
      t.title.toLowerCase().includes(q) || 
      (t.description && t.description.toLowerCase().includes(q))
    );
  }

  get pendingTasks(): Task[] {
    return this.filteredTasks.filter(t => t.status === TaskStatus.Pending);
  }

  get inProgressTasks(): Task[] {
    return this.filteredTasks.filter(t => t.status === TaskStatus.InProgress);
  }

  get completedTasks(): Task[] {
    return this.filteredTasks.filter(t => t.status === TaskStatus.Completed);
  }

  constructor(
    private taskService: TaskService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.tasksSub?.unsubscribe();
  }

  loadTasks(): void {
    this.isLoading    = true;
    this.errorMessage = '';

    this.tasksSub = this.taskService.getAllTasks().subscribe({
      next: (data: Task[]) => {
        this.tasks     = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error(error);
        this.errorMessage = 'api error: ' + (error?.message || 'Unknown error');
        this.toastr.error(this.errorMessage, 'Error');
        this.isLoading    = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.toastr.success('Task deleted successfully', 'Success');
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('error in deletion:', error);
        this.toastr.error('Failed to delete task.', 'Error');
      }
    });
  }

  startTask(id: number): void {
    this.taskService.startTask(id).subscribe({
      next: (res: { message: string }) => {
        console.log(res.message);
        this.toastr.success('Task started! Go get it!', 'Success');
        const task = this.tasks.find(t => t.id === id);
        if (task) task.status = TaskStatus.InProgress;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('error in starting task:', error);
        this.toastr.error('Failed to start task.', 'Error');
      }
    });
  }
}
