import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const CSV_NAME = 'Elevate215-School-Data - PHL School Performance Model.xlsx - School Rollup.csv';
const source = process.env.SCHOOL_DATA_CSV ?? path.join(process.cwd(), CSV_NAME);
const target = path.join(process.cwd(), 'school-data', 'schools.json');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

if (!existsSync(source)) {
  console.warn(`[schools] ${path.basename(source)} not found. The school picker will only offer schools already in the notes.`);
  process.exit(0);
}

const rows = parseCsv(readFileSync(source, 'utf8'));
const header = rows.shift() ?? [];
const nameIndex = header.findIndex(h => h.trim() === 'SchoolName');
if (nameIndex === -1) {
  console.error(`[schools] no SchoolName column in ${path.basename(source)}. Expected one of: ${header.join(', ')}`);
  process.exit(1);
}

const seen = new Set();
for (const row of rows) {
  const name = (row[nameIndex] ?? '').trim().replace(/\s+/g, ' ');
  if (name) seen.add(name);
}
const schools = [...seen].sort((a, b) => a.localeCompare(b, 'en'));

mkdirSync(path.dirname(target), { recursive: true });
writeFileSync(target, JSON.stringify({ source: path.basename(source), count: schools.length, schools }, null, 2) + '\n', 'utf8');
console.log(`[schools] ${schools.length} schools from ${rows.length} rows -> ${path.relative(process.cwd(), target)}`);
