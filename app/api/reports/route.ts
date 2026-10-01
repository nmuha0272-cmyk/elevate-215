import { NextResponse } from 'next/server';
import { normalize } from '@/lib/note';
import { DECISIONS, type Report, type ReviewStatus } from '@/lib/report';
import { readNotes, readReports, writeReports } from '@/lib/store';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { name?: string; noteIds?: unknown } | null;
  const name = normalize(body?.name);
  const requested = Array.isArray(body?.noteIds) ? body.noteIds.map(normalize).filter(Boolean) : [];
  if (!name) return NextResponse.json({ error: 'Give the report a name.' }, { status: 400 });
  if (!requested.length) return NextResponse.json({ error: 'A report needs at least one note.' }, { status: 400 });

  const known = new Set((await readNotes()).map(n => n.id));
  const noteIds = requested.filter(id => known.has(id));
  if (!noteIds.length) return NextResponse.json({ error: 'Those notes are gone. Try building the report again.' }, { status: 400 });

  const report: Report = { id: crypto.randomUUID(), name, noteIds, created: Date.now(), status: 'Not reviewed', reviewNote: '', reviewedAt: 0 };
  const reports = [report, ...(await readReports())];
  await writeReports(reports);
  return NextResponse.json({ reports });
}

export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => null)) as { id?: string; status?: string; reviewNote?: string } | null;
  const id = normalize(body?.id);
  const status = DECISIONS.includes(body?.status as ReviewStatus) ? (body?.status as ReviewStatus) : null;
  if (!id || !status) return NextResponse.json({ error: 'Which report, and what decision?' }, { status: 400 });

  const reports = await readReports();
  const report = reports.find(r => r.id === id);
  if (!report) return NextResponse.json({ error: 'That report is already gone.' }, { status: 404 });

  const next = reports.map(r => (r.id === id
    ? { ...r, status, reviewNote: normalize(body?.reviewNote), reviewedAt: Date.now() }
    : r));
  await writeReports(next);
  return NextResponse.json({ reports: next });
}

export async function DELETE(req: Request) {
  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  const id = normalize(body?.id);
  if (!id) return NextResponse.json({ error: 'Which report?' }, { status: 400 });

  const reports = await readReports();
  const next = reports.filter(r => r.id !== id);
  if (next.length === reports.length) return NextResponse.json({ error: 'That report is already gone.' }, { status: 404 });

  await writeReports(next);
  return NextResponse.json({ reports: next });
}
