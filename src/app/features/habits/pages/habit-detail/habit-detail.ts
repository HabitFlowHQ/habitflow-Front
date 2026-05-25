import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HabitService } from '../../../../core/services/habit.service';
import { Habit } from '../../../../shared/models/habit.model';

@Component({
  selector: 'app-habit-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './habit-detail.html',
  styleUrl: './habit-detail.scss',
})
export class HabitDetail implements OnInit {

  habit: Habit | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private habitService: HabitService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.errorMessage = 'Habit ID not found in URL';
      return;
    }
    this.loadHabit(+idParam);
  }

  loadHabit(id: number): void {
    this.isLoading = true;
    this.habitService.getHabitById(id).subscribe({
      next: (data) => {
        this.habit     = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.status === 404 ? 'Habit not found' : 'Failed to load habit';
        this.isLoading    = false;
      }
    });
  }

  deleteHabit(): void {
    if (!this.habit) return;
    if (!confirm('Are you sure you want to delete this habit?')) return;
    this.habitService.deleteHabit(this.habit.id).subscribe({
      next: () => this.router.navigate(['/habits']),
      error: (err) => console.error(err)
    });
  }

  completeHabit(): void {
    if (!this.habit) return;
    this.habitService.completeHabit(this.habit.id).subscribe({
      next: (msg) => {
        console.log(msg);
        this.loadHabit(this.habit!.id);
      },
      error: (err) => console.error(err)
    });
  }
}
