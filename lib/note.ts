export type Status = 'On track' | 'Off track';

export type Note = {
  id: string;
  school: string;
  date: string;
  metric: string;
  status: Status;
  notes: string;
  visitedBy: string;
  funder: string;
  created: number;
};

export const normalize = (value: unknown) => String(value ?? '').trim().replace(/\s+/g, ' ');

export function canonical(value: unknown, existing: string[]): string {
  const v = normalize(value);
  return existing.find(e => e.toLowerCase() === v.toLowerCase()) || v;
}
