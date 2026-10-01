import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { emptyFilters, filterNotes } from './filter.ts';
import type { Note } from './note.ts';
import { SAMPLE_IDS, buildSampleNotes } from './sample-notes.ts';

describe('filterNotes with no filters selected', () => {
  it('returns all 12 sample notes, most recently visited school first', () => {
    const all = buildSampleNotes();
    const before = all.map(n => n.id);

    const result = filterNotes(all, emptyFilters);

    assert.equal(SAMPLE_IDS.length, 12, 'the sample seed should hold 12 notes');
    assert.equal(result.length, 12, 'no filter is set, so nothing should be excluded');

    assert.deepEqual(
      result.map(n => n.id).slice().sort(),
      before.slice().sort(),
      'every sample note should come back, none added or dropped',
    );

    const dates = result.map(n => n.date);
    assert.deepEqual(
      dates,
      [...dates].sort((a, b) => b.localeCompare(a)),
      'dates should be in descending order',
    );

    assert.equal(result[0].school, 'MARTIN LUTHER KING HS');
    assert.equal(result[0].date, '2026-10-01', 'the 2026-10-01 visit is the most recent one');

    assert.deepEqual(
      all.map(n => n.id),
      before,
      'filterNotes must not reorder the array it was given',
    );
  });
});

describe('filterNotes ordering', () => {
  it('breaks a date tie on created, newest first', () => {
    const note = (id: string, date: string, created: number): Note => ({
      id,
      school: 'LINCOLN HS',
      date,
      metric: 'Attendance',
      status: 'On track',
      notes: 'tie',
      visitedBy: 'Renée Okonkwo',
      funder: 'William Penn Foundation',
      created,
    });

    const input = [
      note('a', '2026-09-11', 100),
      note('b', '2026-09-11', 300),
      note('c', '2026-09-11', 200),
      note('d', '2026-09-09', 400),
    ];

    assert.deepEqual(
      filterNotes(input, emptyFilters).map(n => n.id),
      ['b', 'c', 'a', 'd'],
      'same date sorts by created descending, and a later date still outranks created',
    );
  });
});
