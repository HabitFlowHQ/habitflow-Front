import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
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
  isCompleting = false;
  errorMessage = '';

  constructor(
    private habitService: HabitService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('[HabitDetail] Component OnInit initialized');
    this.route.paramMap.subscribe({ //URL parameters are observable, so we subscribe to changes
      next: (params) => {
        const idParam = params.get('id'); // take the "id" parameter from the URL
        console.log('[HabitDetail] Route parameter "id" changed:', idParam);
        if (!idParam) {
          this.errorMessage = 'Habit ID not found in URL';
          this.toastr.error(this.errorMessage, 'Error');
          this.cdr.detectChanges();
          return;
        }
        const id = +idParam; // convert the id to a number
        if (isNaN(id)) { //isNan : is Not a Number
          this.errorMessage = 'Invalid Habit ID provided';
          this.toastr.error(this.errorMessage, 'Error');
          this.cdr.detectChanges();
          return;
        }
        this.loadHabit(id);
      },
      error: (err) => {
        console.error('[HabitDetail] Error reading route params:', err);
        this.errorMessage = 'Failed to parse route parameters';
        this.toastr.error(this.errorMessage, 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  loadHabit(id: number): void {
    console.log(`[HabitDetail] Sending API request to load habit ID: ${id}`);
    this.isLoading = true;
    this.errorMessage = '';
    this.habit = null;
    this.cdr.detectChanges();

    this.habitService.getHabitById(id).subscribe({ //call api
      next: (data) => {
        console.log('[HabitDetail] Successfully loaded habit details:', data);
        this.habit     = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[HabitDetail] API error occurred:', err);
        this.errorMessage = err.status === 404
          ? 'Habit not found'
          : 'Failed to load habit (' + (err.message || 'connection error') + ')';
        this.toastr.error(this.errorMessage, 'Error');
        this.isLoading    = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteHabit(): void {
    if (!this.habit) return;
    this.habitService.deleteHabit(this.habit.id).subscribe({ //call api
      next: () => {
        this.toastr.success('Habit deleted successfully', 'Success');
        this.router.navigate(['/habits']);
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to delete habit.', 'Error');
      }
    });
  }

  completeHabit(): void {
    if (!this.habit || this.habit.completedToday || this.isCompleting) return;
    this.isCompleting = true;
    this.cdr.detectChanges();
    this.habitService.completeHabit(this.habit.id).subscribe({
      next: (msg) => {
        console.log(msg);
        this.toastr.success('Habit completed! +10 XP', 'Success');
        this.router.navigate(['/habits']);
      },
      error: (err) => {
        console.error(err);
        const errMsg = err.error || 'Failed to complete habit.';
        this.toastr.warning(errMsg, 'Warning');
        this.isCompleting = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(d: string | null): string { // helper to format date strings for display  2026-06-05 → 05 Jun 2026
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

}
