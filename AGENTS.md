# AGENTS.md

Throwaway prototype for one workflow change from the funder-reporting proposal: Renée logs a metric and an
on/off-track status with each school visit, so Stacy can look notes up without reading every one.
`SPEC.md` is the requirements source for the notes and `SPEC-2-REVIEW.md` for the report
review gate; `prototype/TRIAL.md` is the two-week trial runbook and covers the notes step only. Read them
before changing scope. The trial is testing the workflow, not the software.

## Commands

Next.js 16 App Router, TypeScript, no database.

- `npm run dev` — dev server on :3000. `predev` regenerates the school list first.
- `npm run build` / `npm start` — production build and serve.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run schools` — regenerate `school-data/schools.json` from the rollup CSV.

There is no test suite, linter, or CI. Verification is `npm run typecheck` plus running the app and
exercising it; never report "tests pass".

## How it fits together

- `app/page.tsx` — server component, `force-dynamic` (it reads the note and report files per request, so a
  cached or prerendered page would show stale data). Passes notes, reports and the school list to the client.
- `components/app-shell.tsx` — the left sidebar, the top bar and the tab state. Four tabs, `dashboard`,
  `notes`, `add` and `reports`, owned here and passed down as `tab`; it is the only thing that knows which
  panel is showing, and `dashboard` is the landing tab. It also owns `reports` and the top-bar `search` text,
  because the bell badge needs the waiting count and the search box drives the same filter the notes table
  uses.
- `components/dashboard.tsx` — the four stat cards, the area chart and the donut on the Dashboard tab. Every
  number comes from `lib/stats.ts` off the real notes and reports; there are no hardcoded demo figures, and
  each panel shows an empty state rather than a fake trend when there is no history. Charts are inline SVG via
  `lib/charts.ts` — no chart library.
- `components/visit-notes.tsx` — the notes UI and all filter state, including the add-note form. Adding a
  note, deleting, loading and removing samples each POST/DELETE and replace local state with the note list
  the API returns, so there is one source of truth and no client-side refetch logic. Both panels stay
  mounted and the closed one is hidden with `hidden`, so a half-typed report name survives a tab switch. The
  text filter lives in the shell and comes in as `search`, so the top bar and the filter row are one input.
- `components/reports.tsx` — the review step. Owns its own report state from `initialReports`; the name box
  pre-fills from `describeFilters()` and only auto-fills while it's untouched, so a report freezes the note
  ids showing at the moment it's created.
- `app/api/notes/route.ts` — `POST` creates, `DELETE` removes one by `id`. Both answer with the full list.
- `app/api/samples/route.ts` — `POST` loads samples under fixed ids, `DELETE` removes only samples.
- `app/api/reports/route.ts` — `POST` creates from a name plus note ids, `PATCH` records a decision
  (`Approved` / `Needs changes` plus an optional note), `DELETE` removes one. All three answer with the full
  report list.
- `lib/note.ts` types and `canonical()`; `lib/report.ts` report types, `isWaiting()`, `notesFor()`;
  `lib/store.ts` the only file that touches the disk (`data/notes.json`, `data/reports.json`, atomic rename);
  `lib/filter.ts` filter/sort/date ranges plus `describeFilters()`; `lib/csv.ts` export; `lib/sample-notes.ts`
  seed data and `isSample()`; `lib/options.ts` the staff/funder/metric vocabularies; `lib/schools.ts` reads
  the list; `lib/stats.ts` dashboard series and `lib/charts.ts` SVG path maths. Keep `node:fs` imports inside
  `store.ts` and `schools.ts` — everything else is imported by client code.
- Storage is `data/notes.json` and `data/reports.json`: read, modify, write, atomic rename. No database, no
  locking beyond the one Node process, and no live sync — another person's note or decision shows up on
  refresh.
- `prototype/index.html` and `prototype/shared.html` are the previous two-file prototype, superseded by this
  app. Leave them alone unless asked. `prototype/TRIAL.md` is the only requirements doc still left in that
  folder, and it now describes this app, not those pages.

## Values that break silently if changed

- Status is exactly `"On track"` / `"Off track"` / `"Failed"`. String equality, the CSV export, the API's status check, and
  the CSS `:has(input[value="On track"]:checked)` styling all depend on those exact strings.
- A report's status is exactly `"Not reviewed"` / `"Approved"` / `"Needs changes"`, and only the last two can
  be decided to — `PATCH` rejects `"Not reviewed"` deliberately, because a decision can't be taken back.
- Table order is `date` descending, tie-broken by `created` descending.
- Sample notes need a `sample-` id prefix and a `[Sample] ` note prefix — that is how "Remove sample notes" and
  the visible marker work. Fixed ids `sample-00`…`sample-10` so loading twice rewrites rather than duplicates.
- CSV cells starting `= + - @ tab CR` get a `'` prefix so Excel and Sheets treat them as text, not formulas
  (commit `4643a08` in the old prototype). Keep it.
- "This school year" means since July 1 (`month >= 6`).
- ISO days come from `toLocaleDateString('en-CA')`, never `toISOString()`, which shifts across timezones.
- Note text is trimmed but not whitespace-collapsed — the table renders with `pre-wrap` and line breaks in a
  note are meaningful.
- `canonical()` reuses an existing entry's casing case-insensitively, so "lincoln elem" cannot fork into a
  second school. A new school is also canonicalized against the rollup list, so typing `lincoln hs` stores
  `LINCOLN HS` and matches the seeded option.

## Schools come from the rollup CSV

`scripts/build-schools.mjs` parses the 301-row rollup at the repo root and writes 301 unique `SchoolName`
values to `school-data/schools.json`, sorted. It runs on `predev` and `prebuild`. If the CSV is missing it
warns and continues, and the picker falls back to schools already in the notes — a fresh clone has no CSV, so
this path is normal, not a bug. Names are stored verbatim, including inconsistent spacing
(`MASTERY CS - MANN CAMPUS`).

**School data stays out of Git.** `school-data/` and `data/` are gitignored and no school data has ever been
committed. The rollup CSV at the repo root is untracked but *not* covered by `.gitignore` — `git add .` would
commit it. Stage files by name.

That CSV is 301 rows, 301 unique `SchoolName`, 45 columns, mixed `Charter` and `District`, 22 rows with
`ExcludedSelectionCriteria=TRUE`, names in upper case. Sample notes use real schools from it.

## Deliberate limits — do not "fix"

- No editing. A wrong note is deleted and re-added. Same for a report: it's deleted and built again rather
  than re-decided, so a decision can't be quietly changed after someone relies on it.
- No archiving, no per-school "off track for three months" rollup, one status per metric per visit.
- There is no "delete all notes" button: `SPEC.md` grants that to the offline version only, and this is the
  shared one. Say so if someone asks for it rather than adding it.
- Delete and "Remove sample notes" are two-tap confirms with a 4-second timeout, not `confirm()`.
- Stacy has said she doesn't know how to filter in most systems, so the sentence filter and the quick-pick
  chips are the design. No spreadsheet-style filter controls, and the filter sentence wording from SPEC.md
  is part of the thing being trialled.
- The dashboard is dark-navy SaaS styling over the same real data. Don't add decorative metrics or a chart
  with no data behind it — a plausible-looking number in a funder-reporting tool is worse than no number.
- `TRIAL.md` ends with a "do not report these as bugs" list. Check it before changing anything on it.

## Git

Currently on `feat/visit-notes-trial-prototype`; the earlier prototype landed via PR #6 from a `claude/*`
branch. Commit messages are one short imperative sentence naming the user-visible fix. Don't commit unless
asked.
