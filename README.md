# Elevate 215

This repository holds the prototype for the school-visit note workflow and the local school-data folder is ignored from Git.

**Requirements:** `SPEC.md` (notes) and `SPEC-2-REVIEW.md` (the report review gate).
**Trial runbook:** `prototype/TRIAL.md`.

## Running the app

```
npm install
npm run dev          # http://localhost:3000
```

`npm run dev` first regenerates the school list from the rollup CSV at the repo root into `school-data/schools.json`.
If the CSV isn't there it warns and carries on, and the school picker falls back to schools already in the notes.

Notes are saved in `data/notes.json` and `data/reports.json` next to the app — no database. Everyone using the
same link sees the same notes and the same review decisions on refresh.

Also available: `npm run build` / `npm start` for a production build, `npm run typecheck` for `tsc --noEmit`,
and `npm run schools` to regenerate the school list on its own.

`npm test` runs `node --test lib/*.test.ts`. It covers `filterNotes` only — no filters selected, and the
`created` tie-break on equal dates. There is no linter and no CI.

The earlier two-file prototype (`prototype/index.html` and `prototype/shared.html`) is superseded but kept for reference.
