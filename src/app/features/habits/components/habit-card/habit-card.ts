import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit } from '../../../../shared/models/habit.model';

@Component({
  selector: 'app-habit-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './habit-card.html',
  styleUrl: './habit-card.scss',
})
export class HabitCard {

  @Input() habit!: Habit;

  @Output() onComplete = new EventEmitter<number>();

  @Output() onDelete = new EventEmitter<number>();

  complete() {
    this.onComplete.emit(this.habit.id);
  }

  delete() {
    this.onDelete.emit(this.habit.id);
  }
}
