import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule }               from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ToastrService }              from 'ngx-toastr';
import { NoteService }                from '../../../../core/services/note.service';
import { Note }                       from '../../../../shared/models/note.model';
 
@Component({
  selector:    'app-note-detail',
  standalone:  true,
  imports:     [CommonModule, RouterLink],
  templateUrl: './note-detail.html',
  styleUrls:    ['./note-detail.scss'],
})
export class NoteDetail implements OnInit {
 
  private noteService = inject(NoteService);
  private router      = inject(Router);
  private route       = inject(ActivatedRoute);
  private toastr      = inject(ToastrService);
  private cdr         = inject(ChangeDetectorRef);
 
  note:         Note | null = null;
  isLoading                 = false;
  errorMessage              = '';
 
  noteId: number | null = null;
 
  ngOnInit(): void {
    this.route.paramMap.subscribe({
      next: (params) => {
        const idParam = params.get('id');
        if (idParam) {
          this.noteId = Number(idParam);
          this.loadNote(this.noteId);
        } else {
          this.errorMessage = 'Note ID is missing in URL';
          this.toastr.error(this.errorMessage, 'Error');
          this.cdr.detectChanges();
        }
      }
    });
  }
 
  loadNote(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
    this.noteService.getNoteById(id).subscribe({
      next:  (data) => { this.note = data; this.isLoading = false; this.cdr.detectChanges(); },
      error: ()     => { this.errorMessage = 'Note not found.'; this.toastr.error(this.errorMessage, 'Error'); this.isLoading = false; this.cdr.detectChanges(); }
    });
  }
 
  togglePin(): void {
    if (!this.note) return;
    this.noteService.togglePin(this.note.id).subscribe({
      next: (updated) => { 
        if (this.note) {
          this.note.isPinned = updated.isPinned;
          this.toastr.success(updated.isPinned ? 'Note pinned' : 'Note unpinned', 'Success');
        } 
        this.cdr.detectChanges(); 
      },
      error: () => this.toastr.error('Failed to toggle pin state.', 'Error')
    });
  }
 
  deleteNote(): void {
    if (this.noteId === null) return;
    this.noteService.deleteNote(this.noteId).subscribe({
      next:  () => {
        this.toastr.success('Note deleted successfully!', 'Success');
        this.router.navigate(['/notes']);
      },
      error: () => { 
        this.errorMessage = 'Failed to delete note.'; 
        this.toastr.error(this.errorMessage, 'Error');
        this.cdr.detectChanges(); 
      }
    });
  }
 
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
 
  // تحويل breaks للعرض
  formatContent(content: string): string {
    return content.replace(/\n/g, '<br>');
  }
}
