import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { RouterLink }                from '@angular/router';
import { FormsModule }               from '@angular/forms';
import { NoteService }               from '../../../../core/services/note.service';
import { Note }                      from '../../../../shared/models/note.model';
import { ToastrService }             from 'ngx-toastr';
 
@Component({
  selector:    'app-note-list',
  standalone:  true,
  imports:     [CommonModule, RouterLink, FormsModule],
  templateUrl: './note-list.html',
  styleUrls:    ['./note-list.scss'],
})
export class NoteList implements OnInit {
 
  private noteService = inject(NoteService);
  private cdr         = inject(ChangeDetectorRef);
  private toastr      = inject(ToastrService);
 
  notes:        Note[]  = [];
  isLoading           = false;
  errorMessage        = '';
  searchQuery         = '';
  activeTag           = '';
 
  allTags:      string[] = [];
 
  ngOnInit(): void {
    this.loadNotes();
  }
 
  loadNotes(): void {
    this.isLoading    = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
 
    this.noteService.getAllNotes(this.searchQuery, this.activeTag).subscribe({
      next:  (data) => { 
        this.notes = data; 
        this.extractAllTags();
        this.isLoading = false; 
        this.cdr.detectChanges(); 
      },
      error: ()     => { 
        this.errorMessage = 'Failed to load notes.'; 
        this.toastr.error(this.errorMessage, 'Error');
        this.isLoading = false; 
        this.cdr.detectChanges(); 
      }
    });
  }
 
  extractAllTags(): void {
    const s = new Set<string>();
    this.notes.forEach(n => {
      if (n.tagList) {
        n.tagList.forEach(t => {
          if (t) s.add(t);
        });
      }
    });
    this.allTags = Array.from(s);
  }
 
  onSearch(): void {
    this.loadNotes();
  }
 
  filterByTag(tag: string): void {
    this.activeTag = this.activeTag === tag ? '' : tag;
    this.loadNotes();
  }
 
  clearFilters(): void {
    this.searchQuery = '';
    this.activeTag   = '';
    this.loadNotes();
  }
 
  togglePin(note: Note): void {
    this.noteService.togglePin(note.id).subscribe({
      next: (updated) => {
        const i = this.notes.findIndex(n => n.id === note.id);
        if (i !== -1) this.notes[i] = updated;
        // المُثبَّتة تصعد للأعلى
        this.notes.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
        this.cdr.detectChanges();
      }
    });
  }
 
  deleteNote(id: number): void {
    this.noteService.deleteNote(id).subscribe({
      next:  () => {
        this.notes = this.notes.filter(n => n.id !== id);
        this.toastr.success('Note deleted successfully!', 'Success');
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to delete note.';
        this.toastr.error(this.errorMessage, 'Error');
        this.cdr.detectChanges();
      }
    });
  }
 
  // Preview: أول 120 حرف من الـ content
  preview(content: string): string {
    return content.length > 120 ? content.slice(0, 120) + '…' : content;
  }
 
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}
