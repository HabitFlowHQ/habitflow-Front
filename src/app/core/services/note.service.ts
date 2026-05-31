import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note, CreateNoteDto, UpdateNoteDto } from '../../shared/models/note.model';
 
@Injectable({ providedIn: 'root' })
export class NoteService {
 
  private readonly apiUrl = 'http://localhost:5066/api/notes';
  private http = inject(HttpClient);
 
  // GET ALL — مع optional search و tag
  getAllNotes(search?: string, tag?: string): Observable<Note[]> {
    let params = new HttpParams();
    if (search?.trim()) params = params.set('search', search.trim());
    if (tag?.trim())    params = params.set('tag',    tag.trim());
    return this.http.get<Note[]>(this.apiUrl, { params });
  }
 
  // GET BY ID
  getNoteById(id: number): Observable<Note> {
    return this.http.get<Note>(`${this.apiUrl}/${id}`);
  }
 
  // CREATE
  createNote(dto: CreateNoteDto): Observable<Note> {
    return this.http.post<Note>(this.apiUrl, dto);
  }
 
  // UPDATE
  updateNote(id: number, dto: UpdateNoteDto): Observable<Note> {
    return this.http.put<Note>(`${this.apiUrl}/${id}`, dto);
  }
 
  // DELETE
  deleteNote(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
 
  // TOGGLE PIN
  togglePin(id: number): Observable<Note> {
    return this.http.post<Note>(`${this.apiUrl}/${id}/pin`, {});
  }
}
