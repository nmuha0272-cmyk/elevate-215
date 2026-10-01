import { NextResponse } from 'next/server';
import { emptyFilters, filterNotes, type Filters, type When } from '@/lib/filter';
import { canonical, normalize, STATUSES, type Note, type Status } from '@/lib/note';
import { DEFAULT_METRICS, FUNDERS, STAFF } from '@/lib/options';
import { loadSchools } from '@/lib/schools';
import { readNotes, writeNotes } from '@/lib/store';

const WHENS: string[] = ['', '30', '90', 'year', 'custom'];

function filtersFrom(params: URLSearchParams): Filters {
  const when = params.get('when') ?? '';
  return {
    ...emptyFilters,
    school: params.get('school') ?? '',
    metric: params.get('metric') ?? '',
    status: params.get('status') ?? '',
    funder: params.get('funder') ?? '',
    when: WHENS.includes(when) ? (when as When) : '',
    from: params.get('from') ?? '',
    to: params.get('to') ?? '',
    text: params.get('text') ?? '',
  };
}

export async function GET(req: Request) {
  const filters = filtersFrom(new URL(req.url).searchParams);
  const notes = await readNotes();
  return NextResponse.json({ notes: filterNotes(notes, filters), filters });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<Note> | null;
  const [notes, schools] = await Promise.all([readNotes(), loadSchools()]);

  const school = canonical(body?.school, [...schools, ...notes.map(n => n.school)]);
  const metric = canonical(body?.metric, [...DEFAULT_METRICS, ...notes.map(n => n.metric)]);
  const visitedBy = canonical(body?.visitedBy, [...STAFF, ...notes.map(n => n.visitedBy)]);
  const funder = canonical(body?.funder, [...FUNDERS, ...notes.map(n => n.funder)]);
  const date = normalize(body?.date);
  const status = STATUSES.includes(body?.status as Status) ? (body?.status as Status) : null;

  if (!school || !metric || !visitedBy || !status) {
    return NextResponse.json({ error: 'School, metric, status and visited by are all needed.' }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'The visit date has to be a real date.' }, { status: 400 });
  }

  const note: Note = {
    id: crypto.randomUUID(),
    school,
    date,
    metric,
    status,
    notes: String(body?.notes ?? '').trim(),
    visitedBy,
    funder,
    created: Date.now(),
  };

  const next = [...notes, note];
  await writeNotes(next);
  return NextResponse.json({ notes: next });
}

export async function DELETE(req: Request) {
  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  const id = normalize(body?.id);
  if (!id) return NextResponse.json({ error: 'Which note?' }, { status: 400 });

  const notes = await readNotes();
  const next = notes.filter(n => n.id !== id);
  if (next.length === notes.length) return NextResponse.json({ error: 'That note has already been deleted.' }, { status: 404 });

  await writeNotes(next);
  return NextResponse.json({ notes: next });
}
