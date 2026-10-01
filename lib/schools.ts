import { promises as fs } from 'node:fs';
import path from 'node:path';

const FILE = path.join(process.cwd(), 'school-data', 'schools.json');

export async function loadSchools(): Promise<string[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, 'utf8'));
    return Array.isArray(parsed?.schools) ? parsed.schools : [];
  } catch {
    return [];
  }
}
