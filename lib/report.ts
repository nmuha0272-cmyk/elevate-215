import type { Note } from './note';

export type ReviewStatus = 'Not reviewed' | 'Approved' | 'Needs changes';

export const DECISIONS: ReviewStatus[] = ['Approved', 'Needs changes'];

export type Report = {
  id: string;
  name: string;
  noteIds: string[];
  created: number;
  status: ReviewStatus;
  reviewNote: string;
  reviewedAt: number;
};

export const isWaiting = (r: Report) => r.status === 'Not reviewed';

export function notesFor(r: Report, notes: Note[]): Note[] {
  return r.noteIds.map(id => notes.find(n => n.id === id)).filter((n): n is Note => !!n);
}
