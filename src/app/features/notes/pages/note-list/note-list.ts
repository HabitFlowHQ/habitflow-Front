import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { RouterLink }                from '@angular/router';
import { FormsModule }               from '@angular/forms';
import { NoteService }               from '../../../../core/services/note.service';
import { Note }                      from '../../../../shared/models/note.model';
 
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
 
  notes:        Note[]  = [];
  isLoading           = false;
  errorMessage        = '';
  searchQuery         = '';
  activeTag           = '';
 
  // كل الـ Tags الموجودة في الـ notes الحالية
  get allTags(): string[] {
    const tags = this.notes.flatMap(n => n.tagList ?? []);
    return [...new Set(tags)];
  }
 
  ngOnInit(): void {
    this.loadNotes();
  }
 
  loadNotes(): void {
    this.isLoading    = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
 
    this.noteService.getAllNotes(this.searchQuery, this.activeTag).subscribe({
      next:  (data) => { this.notes = data; this.isLoading = false; this.cdr.detectChanges(); },
      error: ()     => { this.errorMessage = 'Failed to load notes.'; this.isLoading = false; this.cdr.detectChanges(); }
    });
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
    if (!confirm('Delete this note?')) return;
    this.noteService.deleteNote(id).subscribe({
      next:  () => {
        this.notes = this.notes.filter(n => n.id !== id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to delete note.';
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
