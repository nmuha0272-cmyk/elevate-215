'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { describeFilters, type Filters } from '@/lib/filter';
import type { Note } from '@/lib/note';
import { DECISIONS, isWaiting, notesFor, type Report, type ReviewStatus } from '@/lib/report';

const CONFIRM_MS = 4000;
const fmtDate = (d: string) => (d ? new Date(`${d}T00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '');
const fmtWhen = (ms: number) => (ms ? new Date(ms).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '');
const pillClass = (s: ReviewStatus) => (s === 'Approved' ? 'on' : s === 'Needs changes' ? 'off' : 'wait');

export default function Reports({ reports, setReports, notes, shown, filters }: {
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  notes: Note[];
  shown: Note[];
  filters: Filters;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const suggestion = useMemo(() => describeFilters(filters), [filters]);
  useEffect(() => { setName(current => current || suggestion); }, [suggestion]);

  const after = (text: string) => {
    setMessage(text);
    timers.current.push(window.setTimeout(() => setMessage(''), 2500));
  };

  async function send(method: 'POST' | 'PATCH' | 'DELETE', body: unknown): Promise<boolean> {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/reports', {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as { reports?: Report[]; error?: string } | null;
      if (!res.ok || !data?.reports) {
        setError(data?.error ?? 'Could not save. Check your connection and try again.');
        return false;
      }
      setReports(data.reports);
      return true;
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function create() {
    if (busy || !shown.length) return;
    const ok = await send('POST', { name: name.trim() || suggestion, noteIds: shown.map(n => n.id) });
    if (!ok) return;
    setName('');
    after(`Report created from ${shown.length} notes.`);
  }

  async function decide(report: Report, status: ReviewStatus) {
    if (busy) return;
    const ok = await send('PATCH', { id: report.id, status, reviewNote: drafts[report.id] ?? '' });
    if (!ok) return;
    setDrafts(d => {
      const { [report.id]: _dropped, ...rest } = d;
      return rest;
    });
    after(status === 'Approved' ? 'Approved. This report is ready to send.' : 'Marked as needing changes.');
  }

  function askDelete(report: Report) {
    if (pendingDelete !== report.id) {
      setPendingDelete(report.id);
      timers.current.push(window.setTimeout(() => setPendingDelete(null), CONFIRM_MS));
      return;
    }
    setPendingDelete(null);
    void send('DELETE', { id: report.id });
  }

  const waiting = reports.filter(isWaiting);
  const reviewed = reports.filter(r => !isWaiting(r));

  const card = (r: Report) => {
    const inReport = notesFor(r, notes);
    return (
      <article key={r.id} className={`report ${r.status === 'Approved' ? 'ok' : r.status === 'Needs changes' ? 'bad' : ''}`}>
        <div className="row report-head">
          <span className={`pill ${pillClass(r.status)}`}>{r.status}</span>
          <strong>{r.name}</strong>
          <span className="cell-sub">{inReport.length} notes · made {fmtWhen(r.created)}</span>
        </div>

        {isWaiting(r) ? (
          <div className="row">
            <input
              className="review-input"
              aria-label={`What needs to change in ${r.name}`}
              placeholder="Optional: what needs to change"
              value={drafts[r.id] ?? ''}
              onChange={e => setDrafts(d => ({ ...d, [r.id]: e.target.value }))}
            />
            {DECISIONS.map(d => (
              <button key={d} type="button" className={d === 'Approved' ? '' : 'secondary'} disabled={busy} onClick={() => decide(r, d)}>
                {d}
              </button>
            ))}
          </div>
        ) : (
          <>
            {r.reviewNote && <p className="review-note">{r.reviewNote}</p>}
            <div className="row">
              <span className="cell-sub">Reviewed {fmtWhen(r.reviewedAt)}</span>
              <button type="button" className="link danger" disabled={busy} onClick={() => askDelete(r)}>
                {pendingDelete === r.id ? 'Confirm: remove this report' : 'Remove report'}
              </button>
            </div>
          </>
        )}

        <details>
          <summary>Show the {inReport.length} notes in this report</summary>
          {inReport.length === 0 ? (
            <p className="empty">The notes in this report have since been deleted.</p>
          ) : (
            <ul className="report-notes">
              {inReport.map(n => (
                <li key={n.id}>
                  <span className="cell-sub">{fmtDate(n.date)} · {n.visitedBy}</span>
                  <span className="report-note-school">{n.school}{n.funder && <span className="cell-sub">{n.funder}</span>}</span>
                  <span className={`pill ${pillClass(n.status === 'On track' ? 'Approved' : 'Needs changes')}`}>{n.metric} · {n.status}</span>
                  {n.notes && <span className="report-note-text">{n.notes}</span>}
                </li>
              ))}
            </ul>
          )}
        </details>
      </article>
    );
  };

  return (
    <section className="card" aria-labelledby="reports-h">
      <div className="find-head">
        <h2 id="reports-h">Reports</h2>
        <p className="hint">Save the notes you are filtered to in Notes as a report, then mark it approved or needing changes before it goes out.</p>
      </div>

      <p className="summary">
        {shown.length > 0
          ? <>A report made now bundles the <strong>{shown.length}</strong> note{shown.length === 1 ? '' : 's'} matching <strong>{suggestion}</strong>.</>
          : <>No notes match the Notes filter right now, so there is nothing to bundle. Change the filter in Notes first.</>}
      </p>

      <div className="row">
        <input
          className="report-name"
          aria-label="Report name"
          placeholder={suggestion}
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button type="button" className="secondary" onClick={create} disabled={busy || shown.length === 0}>
          {shown.length > 0 ? `Save these ${shown.length} notes as a report` : 'No notes match — change the filter in Notes'}
        </button>
        <span className="msg" aria-live="polite">{message}</span>
      </div>

      {error && <p className="notice err" role="alert">{error}</p>}

      <div className="report-group">
        <h3>Waiting on review <span className="cell-sub">{waiting.length}</span></h3>
        {waiting.length === 0 ? <p className="empty">Nothing waiting on a decision.</p> : waiting.map(card)}
      </div>

      <div className="report-group">
        <h3>Reviewed <span className="cell-sub">{reviewed.length}</span></h3>
        {reviewed.length === 0 ? <p className="empty">Nothing reviewed yet.</p> : reviewed.map(card)}
      </div>
    </section>
  );
}
