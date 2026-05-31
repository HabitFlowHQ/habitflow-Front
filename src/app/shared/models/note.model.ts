export interface Note {
  id:        number;
  title:     string;
  content:   string;
  tags:      string | null;
  tagList:   string[];
  isPinned:  boolean;
  createdAt: string;
  updatedAt: string;
}
 
export interface CreateNoteDto {
  title:    string;
  content:  string;
  tags:     string;
  isPinned: boolean;
}
 
export interface UpdateNoteDto {
  title:    string;
  content:  string;
  tags:     string;
  isPinned: boolean;
}
