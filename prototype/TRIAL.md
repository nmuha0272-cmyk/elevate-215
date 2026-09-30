# Trial runbook

Two weeks, two people, one question: **does logging a metric and an on/off-track status with each visit note actually save Stacy time?**

Everything below is a throwaway test. If it works, we build something real. If it doesn't, we learned that for the price of two weeks.

---

## Step 0 — Publish and share (you only, ~10 min)

1. Open `shared.html` and publish it as a page on claude.ai.
2. From the page's **Share** menu, share it. The page is private until you do this.
3. Give **Renée Okonkwo → Contributor** (she needs to add notes).
4. Give **Stacy → Viewer** (she only needs to look notes up).

Send both of them the link.

### Smoke test — do this before you send it

Thirty seconds, and it catches the one failure that would kill the trial.

1. Open your own copy of the link.
2. Add one throwaway note — any school, any metric, On track.
3. Confirm it appears in the table straight away.
4. Delete it.

If the page instead shows *"Shared notes aren't available on this page right now"* or sits on **Loading notes…** forever, the page's storage isn't available on the account. Nothing was saved, and the trial can't run. **Stop and fix this before Renée or Stacy opens the link** — an empty table looks identical to "nothing logged yet", so they will just report that the tool is broken.

> The offline `index.html` is a backup for demos on a laptop. It stores notes in that one browser only, so **do not use it for the trial** — Renée's notes would not reach Stacy.

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
- **The page lives in your claude.ai account.** If that goes away, the notes go with it. Export the CSV before you lose anything.
- **The funder list is only William Penn Foundation and Lenfest Institute** until someone types a new one.

---

## Open questions from the proposal, still open

Carried over from `SPEC.md` — the trial may not answer these:

- Where should this live long term?
- Who reads it besides Stacy?
- How should the query work in a real version?
- How do we measure success: faster turnaround, less rework, or fewer funder follow-ups?
