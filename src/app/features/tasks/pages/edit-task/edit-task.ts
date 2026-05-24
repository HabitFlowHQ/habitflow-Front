// ═══════════════════════════════════════════════════════════
//  الملف: src/app/features/tasks/pages/edit-task/edit-task.ts
//
//  صفحة تعديل مهمة موجودة
//  تستخدم:
//  - GET /api/task/:id  (تحميل البيانات الحالية في الـ form)
//  - PUT /api/task/:id  (حفظ التعديلات)
// ═══════════════════════════════════════════════════════════

import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { TaskService }  from '../../../../core/services/task.service';
import { UpdateTaskDto, TaskPriority } from '../../../../shared/models/task.model';

@Component({
  selector: 'app-edit-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-task.html',
  styleUrl: './edit-task.scss'
})
export class EditTask implements OnInit {

  taskId: number = 0;


  formData: UpdateTaskDto = {
    title: '',
    description: '',
    priority: TaskPriority.Medium,
    dueDate: '',
    estimatedMinutes: 30
  };

  isLoadingTask = true;
  isSaving      = false;
  errorMessage  = '';

  TaskPriority = TaskPriority;

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;

    this.taskId = id;
    this.loadCurrentTask(id);
  }

  loadCurrentTask(id: number): void {
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {

        this.formData = {
          title: task.title,
          description: task.description ?? '',
          priority: task.priority,
          dueDate: task.dueDate ?? '',
          estimatedMinutes: task.estimatedMinutes
        };
        this.isLoadingTask = false;
      },
      error: () => {
        this.errorMessage  = ' task not found';
        this.isLoadingTask = false;
      }
    });
  }


  onSubmit(): void {
    if (!this.formData.title.trim()) {
      this.errorMessage = ' title is required';
      return;
    }

    this.isSaving     = true;
    this.errorMessage = '';

    this.taskService.updateTask(this.taskId, this.formData).subscribe({
      next: () => {
        this.router.navigate(['/tasks', this.taskId]);
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Failed to save. Please try again';
        this.isSaving = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/tasks', this.taskId]);
  }
}
