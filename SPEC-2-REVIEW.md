# Spec 2: Report Review Gate

Companion to [`SPEC.md`](SPEC.md). Same users, same notes, one more step: a funder report can't go out
without someone besides Stacy having looked at it.

## Goal
Let Priya mark a funder report as reviewed before it goes out, so a report can't be sent without someone
besides Stacy having looked at it first.

## Who uses it
- **Stacy** builds a report out of a set of visit notes once it's ready to send.
- **Priya** looks it over and marks the decision.

## What it does

**Takes as input:**
- A report — or the set of visit notes selected for a funder — ready to send
- Priya's review decision: **Approved** / **Needs changes**
- An optional note from Priya explaining what needs to change

**Produces:**
- A visible status on the report: **Not reviewed** / **Approved** / **Needs changes**
- If "Needs changes", Priya's note shown alongside the report
- A simple list of the reports still waiting on review

## Done when

- A report starts as **"Not reviewed."**
- Priya can mark it **Approved** or **Needs changes**, with an optional note.
- The status and the note are visible and persist after a page reload.
- A report marked **"Needs changes"** is visually distinct from one marked **"Approved,"** so it's obvious at
  a glance which reports are actually ready to send.

## Scope / limits

Carried from spec v1 of the notes prototype:

- **No login.** Anyone with the link can add notes, delete them, and decide a report. There are no
  Contributor/Viewer roles, because there is no user model to hang them on.
- ~~**No server — local storage only.**~~ **Superseded 30 Sep 2026.** The review step is built into the
  Next.js app alongside the notes, and its status is stored next to them in `data/reports.json`. The line
  above came from spec v1, when the notes lived in one person's browser — and it does not survive contact
  with this feature: a decision Priya makes in her own browser would be invisible to Stacy, which is the one
  thing the review gate exists to prevent. Same reasoning as spec v1's own shared/offline split. Everything
  else in that line still holds: no database, no accounts, no permissions.
- **No real send action.** This only tracks review status; it doesn't email anyone.
- **No editing.** A decided report is removed and built again rather than re-decided, so a decision can't be
  quietly changed after someone has relied on it. Removing a report is deliberately *not* in this spec, but
  it was added in the build, because a decision recorded by mistake would otherwise be permanent.
- **A report freezes its notes.** It holds the notes that were showing when it was created; notes added
  afterwards don't join it. A review that silently changed underneath the reviewer would be worse than one
  that was slightly out of date.

## What this prototype assumes, and may not survive contact with Priya

Both of these are assumptions made so the thing could be built and tested today, not answers:

- **The review happens after a report is drafted.** Stacy builds the report, Priya reviews it, then it goes.
- **Priya sees the notes behind the report.** There is no generated draft document in this prototype — the
  report shows the raw visit notes it was built from, inside a collapsed list.

## Known limits

- **No live sync.** A decision Priya makes shows up in Stacy's window on her next refresh, not while she's
  looking at it.
- **Anyone with the link can remove a decided report,** including one somebody else approved.
- **A report whose notes are all deleted** stays in the list and says so, rather than disappearing. That way
  the gap is visible rather than silent.
- Review status lives in the same file-based store as the notes, so it inherits the same durability: if
  `data/reports.json` is lost, so is the record of who approved what.

## Still open, not answered by this spec

- **Exactly when in Stacy's workflow the review happens** — before she drafts, after the draft, or just
  before sending.
- **What format Priya actually sees** — the drafted report, or the raw notes and data behind it.

Both are named as open questions in the scope document, and both change what should be built. This prototype
assumes the simplest case so the workflow can be tested now; either assumption may need to change once
they're confirmed with Priya directly.