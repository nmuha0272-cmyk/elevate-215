# Trial runbook

Two weeks, two people, one question: **does logging a metric and an on/off-track status with each visit note actually save Stacy time?**

Everything below is a throwaway test. If it works, we build something real. If it doesn't, we learned that for the price of two weeks.

---

## Step 0 — Start the app and share the link (you only, ~10 min)

1. `npm install`, then `npm run dev` in this repository.
2. Open http://localhost:3000 yourself. It opens on the **Dashboard**; click **Notes** in the tab bar and confirm the table is empty.
3. Work out who can reach that address — Renée and Stacy need the link, and if they are not on the same network you need somewhere it is hosted. **The notes are a file on the machine running this**, so it has to stay on for the whole two weeks.
4. Send both of them the link.

### Smoke test — do this before you send it

Thirty seconds, and it catches the one failure that would kill the trial.

1. Open your own copy of the link.
2. Click **Add a note** in the tab bar and add one throwaway note — any school, any metric, On track.
3. Click **Notes** and confirm it appears in the table straight away.
4. **Open the same link in a private/incognito window and confirm the note is there too.** This is the step that matters: the old prototype's shared page never actually worked, and a note that only lives in one browser looks identical to a working page.
5. Delete the throwaway note.

If the note doesn't survive into the second window, the two of them are not looking at the same notes and the trial can't run. If the page won't load at all, the server isn't running — the notes are not saved anywhere else.

---

## Step 1 — The baseline (ask Stacy this FIRST, before she opens the tool)

Do this part before Stacy sees the new page, or she will not remember how long the old way took.

> Pick a funder question you've actually answered in the last month — for example *"what did William Penn's money do at Lincoln this year?"*
>
> How long did it take you to answer it, start to finish, using how you work today? And can you walk me through what you had to do to get there?

Record three things:

| | |
|---|---|
| **Wall-clock time** | minutes, start to finish |
| **Steps she took** | where did she look, what did she open |
| **How many notes she read** | this is the number that matters |

If she answered from memory, or from an email she already had, say so — that is a valid baseline too, and worth knowing.

---

## Step 2 — Renée's pass (~10 min, one real visit)

Ask her to add notes from a visit she actually made, for one school:

1. Enter the school and visit date.
2. Tap **Save note**. Notice that school and date stay filled in and the metric box empties — she can log the next metric straight away without re-typing the school.
3. Repeat for each metric she covered on that visit.

**Watch for, do not help with:**

- Does she pick a metric off the list, or does she have to invent wording?
- Does she hesitate between **On track** and **Off track**? Is "off track" too harsh a word to type about a school she likes?
- Did she want to go back and fix a note she got wrong? *(There is no edit — she would have to delete and re-add. That is a known limit, not a bug. But note whether it came up.)*
- Did she add the funder, or skip it? If she skipped it, that field may not be earning its place.

---

## Step 3 — Stacy's pass (~15 min)

Give her a real question, not a contrived one. Good ones:

- *"What did William Penn's money do at Lincoln this school year?"*
- *"Which schools are off track on chronic absenteeism?"*
- *"Show me everything Marcus flagged in the last 90 days."*

The filter is written as a sentence — *"Show notes from [school] about [metric] that are [on or off track] for [funder] visited [when]"* — and there are quick-pick buttons above it for the common cases. **Do not point these out.** The point is to find out whether she discovers them.

Then ask:

> How long did that take? Compared to the last time you answered something like this — faster, same, or slower?
>
> Did you use the filters, or did you just scroll and read? Did you go back to your old way partway through?

**The comparison against Step 1 is the entire experiment.** Without the baseline number there is nothing to conclude.

---

## Step 4 — Debrief (~10 min each)

Ask both of these, separately:

1. What felt clumsy? What did you have to work around?
2. What was missing that you needed?
3. Was anything here you would *not* do in real life, and why?

For Renée, the important one is whether marking a metric on every visit is sustainable — it is extra work on every visit, and that cost has to be smaller than the time it gives back.

---

## What to record

| Date | Person | Task | Time | Notes read | Verdict |
|---|---|---|---|---|---|
| | Stacy | baseline: funder question | | | |
| | Stacy | same question, new tool | | | |
| | Renée | logged 1 visit | | | |

---

## What success looks like

- Stacy answers a funder question **materially faster** than baseline, and says so herself
- She reaches for the filters instead of scrolling
- Renée marks a metric on most notes **without being reminded**
- Nobody asks for the notes to be searchable in a way the filter doesn't already do

**A partial success is a real result.** If Renée logs metrics but Stacy still reads everything, the problem is the filter, not the logging — and that is worth knowing before we build anything.

---

## Known limits — do not report these as bugs

These are deliberate scope choices for a prototype:

- **No editing.** Fixing a note means deleting it and adding it again.
- **Notes are never archived or summarised.** Nothing tells you a school has been off track for three months running — you still have to look.
- **One status per metric per visit.** No "partly in place."
- **A note only shows up when you refresh.** There's no live sync; Renée's note appears in Stacy's window the next time she reloads.
- **Anyone with the link can delete anyone's notes.** There are no per-person permissions. If a note goes missing during the trial, that is where to look first.
- **The notes are one file on one machine** (`data/notes.json`). If that machine is off, restarted, or the file is deleted, the notes are gone. Download the CSV before anything like that happens.
- **There is no "delete all notes" button** — it belonged to the old offline version, and this is the shared one.
- **The funder list is only William Penn Foundation and Lenfest Institute** until someone types a new one.
- **School names are the rollup's, in capitals** (`LINCOLN HS`, `KIPP PHILADELPHIA CS`). That is the school's name in the data we were given, not a bug in the app.

---

## Open questions from the proposal, still open

Carried over from `SPEC.md` — the trial may not answer these:

- Where should this live long term?
- Who reads it besides Stacy?
- How should the query work in a real version?
- How do we measure success: faster turnaround, less rework, or fewer funder follow-ups?
