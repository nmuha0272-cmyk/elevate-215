import type { Note } from './note';

export type When = '' | '30' | '90' | 'year' | 'custom';

export type Filters = {
  school: string;
  metric: string;
  status: string;
  funder: string;
  when: When;
  from: string;
  to: string;
  text: string;
};

export const emptyFilters: Filters = { school: '', metric: '', status: '', funder: '', when: '', from: '', to: '', text: '' };

const isoDay = (d: Date) => d.toLocaleDateString('en-CA');

export function dateRange(f: Filters): [string, string] {
  if (f.when === '30' || f.when === '90') {
    const from = new Date();
    from.setDate(from.getDate() - Number(f.when));
    return [isoDay(from), ''];
  }
  if (f.when === 'year') {
    const today = new Date();
    return [`${today.getMonth() >= 6 ? today.getFullYear() : today.getFullYear() - 1}-07-01`, ''];
  }
  if (f.when === 'custom') return [f.from, f.to];
  return ['', ''];
}

export const isUnfiltered = (f: Filters) =>
  !f.school && !f.metric && !f.status && !f.funder && !f.when && !f.text.trim();

const WHEN_LABEL: Record<string, string> = {
  '30': 'last 30 days',
  '90': 'last 90 days',
  'year': 'this school year',
};

export function describeFilters(f: Filters): string {
  const parts = [f.school || 'All schools'];
  if (f.metric) parts.push(f.metric.toLowerCase());
  if (f.status) parts.push(f.status.toLowerCase());
  if (f.funder) parts.push(f.funder);
  if (f.text.trim()) parts.push(`"${f.text.trim()}"`);
  if (f.when) parts.push(f.when === 'custom' ? `${f.from} to ${f.to}` : WHEN_LABEL[f.when] ?? f.when);
  return parts.join(' · ');
}

export function filterNotes(all: Note[], f: Filters): Note[] {
  const [from, to] = dateRange(f);
  const text = f.text.trim().toLowerCase();
  return all
    .filter(n => (!f.school || n.school === f.school) && (!f.metric || n.metric === f.metric) && (!f.status || n.status === f.status))
    .filter(n => (!f.funder || n.funder === f.funder) && (!from || (n.date || '') >= from) && (!to || (n.date || '') <= to))
    .filter(n => !text || [n.school, n.metric, n.notes].join(' ').toLowerCase().includes(text))
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.created - a.created);
}
