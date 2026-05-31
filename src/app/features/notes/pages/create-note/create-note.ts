import { Component, inject, ChangeDetectorRef }  from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';
import { Router, RouterLink }  from '@angular/router';
import { NoteService }         from '../../../../core/services/note.service';
 
@Component({
  selector:    'app-create-note',
  standalone:  true,
  imports:     [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-note.html',
  styleUrls:    ['./create-note.scss'],
})
export class CreateNote {
 
  private noteService = inject(NoteService);
  private router      = inject(Router);
  private cdr         = inject(ChangeDetectorRef);
 
  form = {
    title:    '',
    content:  '',
    tags:     '',      // يكتب المستخدم: "work, ideas, coding"
    isPinned: false,
  };
 
  isLoading    = false;
  errorMessage = '';
 
  onSubmit(): void {
    if (!this.form.title.trim() || !this.form.content.trim()) {
      this.errorMessage = 'Title and content are required.';
      this.cdr.detectChanges();
      return;
    }
 
    this.isLoading    = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
 
    this.noteService.createNote(this.form).subscribe({
      next:  (note) => {
        this.router.navigate(['/notes', note.id]);
      },
      error: ()     => {
        this.errorMessage = 'Failed to create note. Please try again.';
        this.isLoading    = false;
        this.cdr.detectChanges();
      }
    });
  }
}
