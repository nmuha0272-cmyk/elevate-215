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
- Load sample notes for demos, marked `[Sample]` (offline version only).
- Delete a note. The offline version can also delete all notes at once.

## Two versions
- **Shared (`shared.html`), the one to use:** published as a private claude.ai page. Notes are saved online with the page, so Renée adds them and Stacy looks them up from her own computer with the same link.
- **Offline (`index.html`):** open the file in any browser. Notes are saved in that browser only.

## Scope
- This is a throwaway prototype for testing the workflow.
- No login beyond claude.ai's own sharing.
- No real database. The shared version uses the claude.ai page's built-in storage; the offline version uses the browser's local storage.
- The goal is to find out whether the workflow is useful before investing in a production version.

## Known limits
- **Sharing:** the shared page is private until its owner shares it from the page's Share menu. Renée needs **Contributor** access (or higher) to add notes. Stacy can look them up with **Viewer** access.
- **Offline version:** notes stay in one browser, and clearing browser data deletes them.
- There's no editing. To fix a note, delete it and add it again.

## Open questions (from the proposal)
- Where should the tag live long term?
- Who reads it besides Stacy?
- How should the query work in the real version?
- How do we measure success: faster turnaround, less rework, or fewer funder follow-ups?
