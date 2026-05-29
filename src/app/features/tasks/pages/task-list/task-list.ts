
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterLink }    from '@angular/router';
import { Subscription }  from 'rxjs';
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

  get filteredTasks(): Task[] {
    if (!this.searchQuery.trim()) {
      return this.tasks;
    }
    const q = this.searchQuery.toLowerCase();
    return this.tasks.filter(t => 
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

  get overdueTasksCount(): number {
    const todayStr = new Date().toISOString().substring(0, 10);
    return this.tasks.filter(t => t.status !== TaskStatus.Completed && t.dueDate && t.dueDate < todayStr).length;
  }

  constructor(
    private taskService: TaskService,
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
        this.isLoading    = false;
        this.cdr.detectChanges();
      }
    });
  }


  deleteTask(id: number): void {
    if (!confirm('are you sure you want to delete this task?')) return;

    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== id);
      },
      error: (error: any) => console.error('error in deletion:', error  )
    });
  }


  startTask(id: number): void {
    this.taskService.startTask(id).subscribe({
      next: (res: { message: string }) => {
        console.log(res.message);

        const task = this.tasks.find(t => t.id === id);
        if (task) task.status = TaskStatus.InProgress;
      },
      error: (error: any) => console.error('error in starting task:', error)
    });
  }




}
