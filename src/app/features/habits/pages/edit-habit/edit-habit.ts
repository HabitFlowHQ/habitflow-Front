import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HabitService } from '../../../../core/services/habit.service';
import { UpdateHabitDto } from '../../../../shared/models/habit.model';

@Component({
  selector: 'app-edit-habit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-habit.html',
  styleUrl: './edit-habit.scss',
})

export class EditHabit implements OnInit {

  habitId!: number;

  dto: UpdateHabitDto = {
    title: '',
    description: '',
    category: '',
    color: '#a4e6ff',
    icon: '',
    endDate: '',
    createdAt: ''
  };

  isLoading    = false;
  isSubmitting = false;
  errorMessage = '';

  readonly iconOptions = [
    '📁', '🗂', '💻', '🎨', '✍️', '🏠', '🏋️', '🎵', '✈️', '🎓', '💼', '🚀', '🌟'
  ];

  constructor(
    private habitService: HabitService,
    private route: ActivatedRoute, // For accessing route parameters
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id'); // get id
    if (!idParam) {
      this.errorMessage = 'Habit ID not found in URL';
      this.toastr.error(this.errorMessage, 'Error');
      this.cdr.detectChanges(); //update view
      return;
    }
    this.habitId = +idParam; //+: convert to number
    this.loadHabit();
  }

  loadHabit(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.habitService.getHabitById(this.habitId).subscribe({
      next: (habit) => { //success
        this.dto = {
          title:         habit.title,
          description:   habit.description,
          category:      habit.category,
          color:         habit.color && habit.color.startsWith('#') ? habit.color : '#a4e6ff',
          icon:          habit.icon,
          endDate:       habit.endDate ? habit.endDate.substring(0, 10) : '', // take 10 chars for yyyy-mm-dd format
          createdAt:     habit.createdAt ? habit.createdAt.substring(0, 10) : '' // : ""  if empty put ""
        };
        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {//error
        this.errorMessage='Failed to load habit for editing.';
        this.toastr.error(this.errorMessage, 'Error');
        this.isLoading= false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  submit(): void {

    if (!this.dto.title.trim() || !this.dto.category.trim()) {
      this.errorMessage = 'Title and Category are required';
      this.toastr.warning(this.errorMessage, 'Warning');
      this.cdr.detectChanges();
      return;
    }

    if (!this.dto.endDate) {
      this.errorMessage = 'End date is required';
      this.toastr.warning(this.errorMessage, 'Warning');
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.habitService.updateHabit(this.habitId, this.dto).subscribe({
      next: () => {
        this.toastr.success('Habit updated successfully!', 'Success');
        this.router.navigate(['/habits', this.habitId]);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to update habit.';
        this.toastr.error(this.errorMessage, 'Error');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
