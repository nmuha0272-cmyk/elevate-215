# Spec: School Visit Notes Prototype

Companion to [`SPEC-2-REVIEW.md`](SPEC-2-REVIEW.md), which adds the review step before a report goes out.

## Goal
Let Renée quickly log school-visit notes with structured metrics and an on/off-track status, so Stacy can filter and review information across schools without reading every note by hand.

## Who uses it
- **Renée** adds a note after each school visit.
- **Stacy** looks up notes across schools, for example when a funder asks what its money did at a school.

## What it does
**Add a school-visit entry with:**
- School, picked from the 301 schools in the rollup CSV at the repo root, so the same school can't be logged under two spellings. A school that isn't in the rollup can still be typed in.
- Visit date
- Metric
- Status (On track / Off track, plus Failed when the visit couldn't be assessed)
- Visited by (Renée Okonkwo or Marcus Feld, who both run site visits)
- Funder (optional, e.g. William Penn Foundation or Lenfest Institute), so Stacy can answer "what did this funder's money do?"
- Notes

**Show entries** in a simple table, newest first.

**Filter entries by:**
- School
- Metric
- Status
- Funder
- Visit date: any time, the last 30 or 90 days, this school year (since July 1), or between two dates. This covers funders who ask for quarterly or mid-year detail.
- A word in the notes (optional)

The filter sits at the top of the page. One-click quick picks ("All notes", "Off track only", "On track only", "This school year", and one button per school showing its off-track count) cover the common lookups. The full filter reads as a sentence: "Show notes from [school] about [metric] that are [on/off track] for [funder] visited [when]." Stacy has said she doesn't know how to filter in most systems, so the prototype avoids spreadsheet-style filter controls.

**Extras:**
- Download the entries currently showing as a CSV file (opens in Excel or Google Sheets).
- Load sample notes for demos, marked `[Sample]`. "Remove sample notes" deletes only the samples and leaves real notes alone.
- Delete a note.

## One version
One Next.js app, at a link Renée and Stacy both open: `npm run dev`, then hand them the URL. Notes are
saved in a JSON file beside the app, so Renée adds them on her machine and Stacy looks them up from her own
computer with the same link. There is no per-person login, so everyone who has the link can add and delete.

The two-file prototype this replaced (`shared.html` and `index.html`) is kept in `prototype/` for reference.

## Scope
- This is a throwaway prototype for testing the workflow.
- No login and no permissions. Anyone with the link can add and delete notes.
- No real database. Notes are a JSON file (`data/notes.json`) read and written by the app.
- The goal is to find out whether the workflow is useful before investing in a production version.

## Known limits
- **Storage is a file, not a service.** The notes live in `data/notes.json` on whichever machine is running the app, so the trial only works while that machine is on and both of them can reach it. Copy the CSV out before you lose anything. There is no backup.
- **The link is the only gate.** No Contributor/Viewer distinction — anyone who has the URL can delete a note, including Renée's. That is deliberate for a two-person trial and is not a security model.
- **No live sync.** A note someone else adds shows up when you refresh, not while you are looking at the page.
- There's no editing. To fix a note, delete it and add it again.
- The earlier offline version could delete all notes at once. This one can't, because it is the shared version. Say so rather than adding it.

## Open questions (from the proposal)
- Where should the tag live long term?
- Who reads it besides Stacy?
- How should the query work in the real version?
- How do we measure success: faster turnaround, less rework, or fewer funder follow-ups?
