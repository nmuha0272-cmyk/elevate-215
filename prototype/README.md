# School Visit Notes (prototype)

A throwaway prototype to test one workflow change from the funder-reporting proposal: Renée adds a metric and an on/off-track status next to each visit note, so Stacy can pull up what she needs without reading every note.

**To run it:** open `index.html` in a browser. No install, no login, no server.

- **Add a visit note:** school, date, metric, on/off track, notes. The school and date stay filled in after you save, so you can log several metrics from one visit.
- **Find notes:** the filter reads as a sentence, "Show notes from [school] about [metric] that are [on/off track]", plus an optional word search. Stacy said she doesn't know how to filter in most systems, so this avoids spreadsheet-style filter controls.
- **Download as spreadsheet (CSV):** saves whatever is showing right now, for pasting into a funder report.
- **Load sample notes:** adds fake data for demos. Each sample note starts with `[Sample]`.

**Limits (on purpose):** notes are saved in this browser only (localStorage). They won't sync between computers or people, and clearing browser data deletes them. The status is only On track or Off track, and there's no editing, just delete and re-add.
