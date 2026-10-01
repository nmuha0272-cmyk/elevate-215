import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Note } from './note';
import type { Report } from './report';

const NOTES_FILE = path.join(process.cwd(), 'data', 'notes.json');
const REPORTS_FILE = path.join(process.cwd(), 'data', 'reports.json');

async function readJson<T>(file: string): Promise<T[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(file, 'utf8'));
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await fs.rename(tmp, file);
}

export const readNotes = () => readJson<Note>(NOTES_FILE);
export const writeNotes = (notes: Note[]) => writeJson(NOTES_FILE, notes);

export const readReports = () => readJson<Report>(REPORTS_FILE);
export const writeReports = (reports: Report[]) => writeJson(REPORTS_FILE, reports);
