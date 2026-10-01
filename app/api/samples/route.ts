import { NextResponse } from 'next/server';
import { buildSampleNotes, isSample } from '@/lib/sample-notes';
import { readNotes, writeNotes } from '@/lib/store';

export async function POST() {
  const notes = await readNotes();
  const samples = buildSampleNotes();
  const ids = new Set(samples.map(s => s.id));
  const next = [...notes.filter(n => !ids.has(n.id)), ...samples];
  await writeNotes(next);
  return NextResponse.json({ notes: next, added: samples.length });
}

export async function DELETE() {
  const notes = await readNotes();
  const next = notes.filter(n => !isSample(n));
  await writeNotes(next);
  return NextResponse.json({ notes: next, removed: notes.length - next.length });
}
