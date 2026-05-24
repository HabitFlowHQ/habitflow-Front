import { Component, EventEmitter, input, output } from '@angular/core';
import { Habit } from '../../../../shared/models/habit.model';

@Component({
  selector: 'app-habit-card',
  standalone: true,
  templateUrl: './habit-card.html',
  styleUrl: './habit-card.scss',
})
export class HabitCard {

  @input() habit!: Habit;

  @output() onComplete = new EventEmitter<number>();

  @output() onDelete = new EventEmitter<number>();

  complete(){
    this.onComplete.emit(this.habit.id);
  }

  delete(){
    this.onDelete.emit(this.habit.id);
  }

}

