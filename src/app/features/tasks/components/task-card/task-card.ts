import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Task, TaskStatus, TaskPriority } from '../../../../shared/models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCard {
  @Input() task!: Task;

  @Output() onStart  = new EventEmitter<number>();
  @Output() onDelete = new EventEmitter<number>();

  TaskStatus   = TaskStatus;
  TaskPriority = TaskPriority;

  start()  { this.onStart.emit(this.task.id); }
  delete() { this.onDelete.emit(this.task.id); }
}
