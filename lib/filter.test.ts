import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { emptyFilters, filterNotes } from './filter.ts';
import { SAMPLE_IDS, buildSampleNotes } from './sample-notes.ts';

describe('filterNotes with no filters selected', () => {
  it('returns all 11 sample notes, most recently visited school first', () => {
    const all = buildSampleNotes();
    const before = all.map(n => n.id);

    const result = filterNotes(all, emptyFilters);

    assert.equal(SAMPLE_IDS.length, 11, 'the sample seed should hold 11 notes');
    assert.equal(result.length, 11, 'no filter is set, so nothing should be excluded');

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

    assert.equal(result[0].school, 'PHILADELPHIA ACADEMY CS');
    assert.equal(result[0].date, '2026-09-30', 'the 2026-09-30 visit is the most recent one');

    assert.deepEqual(
      all.map(n => n.id),
      before,
      'filterNotes must not reorder the array it was given',
    );
  });
});
