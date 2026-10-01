import type { Note } from './note';
import type { Report } from './report';

export const MONTHS = 6;

export type Point = { key: string; label: string; count: number };

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const monthOf = (key: string) => new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, 1);
const labelOf = (key: string) => monthOf(key).toLocaleDateString(undefined, { month: 'short' });

export function monthKeys(count = MONTHS, from = new Date()): string[] {
  const start = new Date(from.getFullYear(), from.getMonth(), 1);
  return Array.from({ length: count }, (_, i) => monthKey(new Date(start.getFullYear(), start.getMonth() - (count - 1 - i), 1)));
}

function tally(keys: string[], into: Map<string, number>) {
  return keys.map(key => ({ key, label: labelOf(key), count: into.get(key) ?? 0 }));
}

export function notesByMonth(notes: Note[], keys: string[]): Point[] {
  const m = new Map<string, number>();
  for (const n of notes) m.set(n.date.slice(0, 7), (m.get(n.date.slice(0, 7)) ?? 0) + 1);
  return tally(keys, m);
}

export function offTrackByMonth(notes: Note[], keys: string[]): Point[] {
  const m = new Map<string, number>();
  for (const n of notes) {
    if (n.status !== 'Off track') continue;
    m.set(n.date.slice(0, 7), (m.get(n.date.slice(0, 7)) ?? 0) + 1);
  }
  return tally(keys, m);
}

export function newSchoolsByMonth(notes: Note[], keys: string[]): Point[] {
  const first = new Map<string, string>();
  for (const n of notes) {
    const key = n.date.slice(0, 7);
    if (!first.has(n.school) || key < first.get(n.school)!) first.set(n.school, key);
  }
  const m = new Map<string, number>();
  for (const key of first.values()) m.set(key, (m.get(key) ?? 0) + 1);
  return tally(keys, m);
}

export function reportsByMonth(reports: Report[], keys: string[]): Point[] {
  const m = new Map<string, number>();
  for (const r of reports) m.set(monthKey(new Date(r.created)), (m.get(monthKey(new Date(r.created))) ?? 0) + 1);
  return tally(keys, m);
}

export type Slice = { label: string; count: number; cls: 'on' | 'off' };

export function statusSplit(notes: Note[]): Slice[] {
  return [
    { label: 'On track', count: notes.filter(n => n.status === 'On track').length, cls: 'on' },
    { label: 'Off track', count: notes.filter(n => n.status === 'Off track').length, cls: 'off' },
  ];
}

export const pct = (part: number, whole: number) => (whole === 0 ? 0 : Math.round((part / whole) * 100));
