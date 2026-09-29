# Spec: School Visit Notes Prototype

## Goal
Let Renée quickly log school-visit notes with structured metrics and an on/off-track status, so Stacy can filter and review information across schools without reading every note by hand.

## Who uses it
- **Renée** adds a note after each school visit.
- **Stacy** looks up notes across schools, for example when a funder asks what its money did at a school.

## What it does
**Add a school-visit entry with:**
- School
- Visit date
- Metric
- Status (On track / Off track)
- Notes

**Show entries** in a simple table, newest first.

**Filter entries by:**
- School
- Metric
- Status
- A word in the notes (optional)

The filter reads as a sentence: "Show notes from [school] about [metric] that are [on/off track]." Stacy has said she doesn't know how to filter in most systems, so the prototype avoids spreadsheet-style filter controls.

**Extras:**
- Download the entries currently showing as a CSV file (opens in Excel or Google Sheets).
- Load sample notes for demos. Each one is marked `[Sample]`.
- Delete one note or all notes.

## Scope
- This is a throwaway prototype for testing the workflow.
- No login.
- No real database. Notes are saved in the browser's local storage.
- The goal is to find out whether the workflow is useful before investing in a production version.

## Known limits
- **Notes stay in one browser.** Stacy can see Renée's notes only on the same computer and browser. Otherwise, Renée has to download the CSV and send it to her.
- Clearing browser data deletes the notes.
- There's no editing. To fix a note, delete it and add it again.

## Open questions (from the proposal)
- Where should the tag live long term?
- Who reads it besides Stacy?
- How should the query work in the real version?
- How do we measure success: faster turnaround, less rework, or fewer funder follow-ups?
