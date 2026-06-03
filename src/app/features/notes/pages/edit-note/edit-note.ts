import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule }               from '@angular/common';
import { FormsModule }                from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ToastrService }              from 'ngx-toastr';
import { NoteService }                from '../../../../core/services/note.service';
 
@Component({
  selector:    'app-edit-note',
  standalone:  true,
  imports:     [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-note.html',
  styleUrls:    ['./edit-note.scss'],
})
export class EditNote implements OnInit {
 
  private noteService = inject(NoteService);
  private router      = inject(Router);
  private route       = inject(ActivatedRoute);
  private toastr      = inject(ToastrService);
  private cdr         = inject(ChangeDetectorRef);
 
  noteId       = 0;
  isLoading    = false;
  errorMessage = '';
 
  form = {
    title:    '',
    content:  '',
    tags:     '',
    isPinned: false,
  };
 
  ngOnInit(): void {
    this.noteId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadNote();
  }
 
  loadNote(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.noteService.getNoteById(this.noteId).subscribe({
      next: (note) => {
        this.form = {
          title:    note.title,
          content:  note.content,
          tags:     note.tags ?? '',
          isPinned: note.isPinned,
        };
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Note not found.';
        this.toastr.error(this.errorMessage, 'Error');
        this.isLoading    = false;
        this.cdr.detectChanges();
      }
    });
  }
 
  onSubmit(): void {
    if (!this.form.title.trim() || !this.form.content.trim()) {
      this.errorMessage = 'Title and content are required.';
      this.toastr.warning(this.errorMessage, 'Warning');
      this.cdr.detectChanges();
      return;
    }
 
    this.isLoading    = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
 
    this.noteService.updateNote(this.noteId, this.form).subscribe({
      next:  () => {
        this.toastr.success('Note updated successfully!', 'Success');
        this.router.navigate(['/notes', this.noteId]);
      },
      error: () => {
        this.errorMessage = 'Failed to update note.';
        this.toastr.error(this.errorMessage, 'Error');
        this.isLoading    = false;
        this.cdr.detectChanges();
      }
    });
  }
}
