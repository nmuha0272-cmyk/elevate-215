'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Dashboard from '@/components/dashboard';
import Reports from '@/components/reports';
import type { Tab } from '@/components/app-shell';
import { toCsv } from '@/lib/csv';
import { emptyFilters, filterNotes, isUnfiltered, type Filters } from '@/lib/filter';
import type { Note, Status } from '@/lib/note';
import { STATUSES, STATUS_CLASS } from '@/lib/note';
import { DEFAULT_METRICS, FUNDERS, STAFF } from '@/lib/options';
import { isSample } from '@/lib/sample-notes';
import type { Report } from '@/lib/report';

const CONFIRM_MS = 4000;

const uniq = (values: string[]) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
const today = () => new Date().toLocaleDateString('en-CA');
const fmtDate = (d: string) => (d ? new Date(`${d}T00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '');

type Form = {
  school: string;
  date: string;
  metric: string;
  status: Status | '';
  notes: string;
  visitedBy: string;
  funder: string;
};

type Props = {
  initialNotes: Note[];
  schools: string[];
  tab: Tab;
  search: string;
  setSearch: (value: string) => void;
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
};

export default function VisitNotes({ initialNotes, schools, tab, search, setSearch, reports, setReports }: Props) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [rest, setRest] = useState<Filters>(emptyFilters);
  const [form, setForm] = useState<Form>({ school: '', date: today(), metric: '', status: '', notes: '', visitedBy: STAFF[0], funder: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [pendingSamples, setPendingSamples] = useState(false);
  const timers = useRef<number[]>([]);
  const filters: Filters = { ...rest, text: search };
  const setFilters = (next: Filters) => { setRest({ ...next, text: '' }); setSearch(next.text); };

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  useEffect(() => { setMessage(''); }, [tab]);

  const after = (text: string) => {
    setMessage(text);
    timers.current.push(window.setTimeout(() => setMessage(''), 2500));
  };

  async function send(method: 'POST' | 'DELETE', url: string, body?: unknown): Promise<boolean> {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { 'content-type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await res.json().catch(() => null)) as { notes?: Note[]; error?: string } | null;
      if (!res.ok || !data?.notes) {
        setError(data?.error ?? 'Could not save. Check your connection and try again.');
        return false;
      }
      setNotes(data.notes);
      return true;
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  const noteSchools = useMemo(() => uniq(notes.map(n => n.school)), [notes]);
  const metrics = useMemo(() => uniq([...DEFAULT_METRICS, ...notes.map(n => n.metric)]), [notes]);
  const funders = useMemo(() => uniq(notes.map(n => n.funder)), [notes]);
  const staff = useMemo(() => uniq([...STAFF, ...notes.map(n => n.visitedBy)]), [notes]);
  const schoolOptions = useMemo(() => uniq([...schools, ...noteSchools]), [schools, noteSchools]);
  const sampleCount = useMemo(() => notes.filter(isSample).length, [notes]);

  const shown = useMemo(() => filterNotes(notes, filters), [notes, filters]);
  const offTrack = shown.filter(n => n.status === 'Off track').length;
  const shownSchools = new Set(shown.map(n => n.school)).size;

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    key === 'text' ? setSearch(String(value)) : setFilters({ ...filters, [key]: value });

  async function saveNote(ev: React.FormEvent) {
    ev.preventDefault();
    if (busy) return;
    const missing: string[] = [];
    if (!form.school.trim()) missing.push('school');
    if (!form.date) missing.push('visit date');
    if (!form.metric.trim()) missing.push('metric');
    if (!form.status) missing.push('On track, Off track or Failed');
    if (missing.length) {
      setFormError(`Still needed before saving: ${missing.join(', ')}.`);
      if (!form.school.trim()) document.getElementById('f-school')?.focus();
      else if (!form.metric.trim()) document.getElementById('f-metric')?.focus();
      else document.querySelector<HTMLInputElement>('.status-pick input')?.focus();
      return;
    }
    setFormError('');
    const ok = await send('POST', '/api/notes', form);
    if (!ok) return;
    setForm(f => ({ ...f, metric: '', status: '', notes: '' }));
    after('Saved. Pick the next metric and status.');
    document.getElementById('f-metric')?.focus();
  }

  function askDelete(note: Note) {
    if (pendingDelete !== note.id) {
      setPendingDelete(note.id);
      timers.current.push(window.setTimeout(() => setPendingDelete(null), CONFIRM_MS));
      return;
    }
    setPendingDelete(null);
    void send('DELETE', '/api/notes', { id: note.id });
  }

  async function loadSamples() {
    if (busy) return;
    const ok = await send('POST', '/api/samples');
    if (ok) after('Sample notes added. Anyone with this link sees them too.');
  }

  async function removeSamples() {
    if (!pendingSamples) {
      setPendingSamples(true);
      timers.current.push(window.setTimeout(() => setPendingSamples(false), CONFIRM_MS));
      return;
    }
    setPendingSamples(false);
    const ok = await send('DELETE', '/api/samples');
    if (ok) after('Sample notes removed.');
  }

  function downloadCsv() {
    const csv = toCsv(shown);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `visit-notes-${today()}.csv` });
    a.click();
    URL.revokeObjectURL(url);
    after(`Downloaded the ${shown.length} notes showing now.`);
  }

  function setFilter(key: keyof Filters, value: string) {
    set(key, value);
  }

  const quick = [
    { label: 'All notes', kind: 'all', value: '', active: isUnfiltered(filters), cls: '' },
    { label: 'Off track only', kind: 'status', value: 'Off track', active: filters.status === 'Off track', cls: 'off' },
    { label: 'On track only', kind: 'status', value: 'On track', active: filters.status === 'On track', cls: 'on' },
    { label: 'Failed only', kind: 'status', value: 'Failed', active: filters.status === 'Failed', cls: 'fail' },
    { label: 'This school year', kind: 'when', value: 'year', active: filters.when === 'year', cls: '' },
    ...noteSchools.map(name => {
      const off = notes.filter(n => n.school === name && n.status === 'Off track').length;
      return { label: off ? `${name} · ${off} off track` : name, kind: 'school', value: name, active: filters.school === name, cls: '' };
    }),
  ];

  return (
    <main>
      <div className="panel" hidden={tab !== 'dashboard'}>
        <Dashboard notes={notes} reports={reports} />
      </div>

      <div className="panel" hidden={tab !== 'notes'}>
        {error && <p className="notice err" role="alert">{error}</p>}

        <section className="card" aria-labelledby="find-h">
          <div className="find-head">
            <h2 id="find-h">Find notes</h2>
            <p className="hint">Pick from the menus, or tap a quick pick. The table updates right away.</p>
          </div>

        <div className="chips" role="group" aria-label="Quick picks">
          {quick.map(c => (
            <button
              key={`${c.kind}-${c.value}`}
              type="button"
              className={`chip ${c.cls}`}
              aria-pressed={c.active}
              onClick={() => {
                if (c.kind === 'all') setFilters(emptyFilters);
                else if (c.kind === 'status') setFilter('status', filters.status === c.value ? '' : c.value);
                else if (c.kind === 'school') setFilter('school', filters.school === c.value ? '' : c.value);
                else setFilter('when', filters.when === c.value ? '' : c.value);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="sentence">
          <span>Show notes from</span>
          <select aria-label="School" value={filters.school} onChange={e => setFilter('school', e.target.value)}>
            <option value="">all schools</option>
            {noteSchools.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span>about</span>
          <select aria-label="Metric" value={filters.metric} onChange={e => setFilter('metric', e.target.value)}>
            <option value="">any metric</option>
            {metrics.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <span>that are</span>
          <select aria-label="Status" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
            <option value="">any status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span>for</span>
          <select aria-label="Funder" value={filters.funder} onChange={e => setFilter('funder', e.target.value)}>
            <option value="">any funder</option>
            {funders.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <span>visited</span>
          <select aria-label="Visit date" value={filters.when} onChange={e => setFilter('when', e.target.value)}>
            <option value="">any time</option>
            <option value="30">in the last 30 days</option>
            <option value="90">in the last 90 days</option>
            <option value="year">this school year (since July 1)</option>
            <option value="custom">between two dates…</option>
          </select>
          {filters.when === 'custom' && (
            <span className="range">
              <input type="date" aria-label="From date" value={filters.from} onChange={e => setFilter('from', e.target.value)} /> and{' '}
              <input type="date" aria-label="To date" value={filters.to} onChange={e => setFilter('to', e.target.value)} />
            </span>
          )}
        </div>

        <div className="row">
          <input
            type="search"
            className="text-search"
            placeholder="Search words in notes (optional)"
            aria-label="Search words in notes"
            value={filters.text}
            onChange={e => setFilter('text', e.target.value)}
          />
          <button type="button" className="secondary" onClick={() => setFilters(emptyFilters)}>Show everything</button>
          <button type="button" className="secondary" onClick={downloadCsv}>Download as spreadsheet (CSV)</button>
        </div>

        <p className="summary" aria-live="polite">
          {notes.length > 0 && (
            <>Showing <strong>{shown.length}</strong> of {notes.length} notes across {shownSchools} school{shownSchools === 1 ? '' : 's'} · <strong>{offTrack}</strong> off track</>
          )}
        </p>

        <div className="table-wrap">
          <table>
            <thead><tr><th>Date · by</th><th>School · funder</th><th>Metric</th><th>Status</th><th>Notes</th><th></th></tr></thead>
            <tbody>
              {shown.length === 0 ? (
                <tr><td colSpan={6} className="empty">
                  {notes.length ? 'No notes match. Try “Show everything”.' : 'No notes yet. Add the first one below, or load sample notes to try it out.'}
                </td></tr>
              ) : shown.map(n => (
                <tr key={n.id}>
                  <td className="date" data-label="Date">{fmtDate(n.date)}{n.visitedBy && <span className="cell-sub">{n.visitedBy}</span>}</td>
                  <td data-label="School">{n.school}{n.funder && <span className="cell-sub">{n.funder}</span>}</td>
                  <td data-label="Metric">{n.metric}</td>
                  <td data-label="Status"><span className={`pill ${STATUS_CLASS[n.status]}`}>{n.status}</span></td>
                  <td className="notes" data-label="Notes">{n.notes}</td>
                  <td className="actions">
                    <button
                      type="button"
                      className={`link${pendingDelete === n.id ? ' danger' : ''}`}
                      onClick={() => askDelete(n)}
                    >
                      {pendingDelete === n.id ? 'Confirm delete' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="row">
          <button type="button" className="link" onClick={loadSamples} disabled={busy}>Load sample notes (for trying it out)</button>
          {sampleCount > 0 && (
            <button type="button" className="link danger" onClick={removeSamples} disabled={busy}>
              {pendingSamples ? `Confirm: remove ${sampleCount} sample notes` : 'Remove sample notes'}
            </button>
          )}
          <span className="msg" aria-live="polite">{message}</span>
        </div>
        </section>
      </div>

      <div className="panel" hidden={tab !== 'add'}>
        {error && <p className="notice err" role="alert">{error}</p>}

        <section className="card" aria-labelledby="add-h">
          <h2 id="add-h">Add a visit note</h2>
          <p className="hint">One metric per note. The school and date stay filled in, so you can log several metrics from the same visit.</p>
        <form onSubmit={saveNote} noValidate>
          {formError && <p className="notice err" role="alert">{formError}</p>}
          <div className="grid">
            <div>
              <label htmlFor="f-school">School</label>
              <input
                id="f-school"
                list="school-list"
                required
                autoComplete="off"
                placeholder="e.g. LINCOLN HS"
                value={form.school}
                onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
              />
              <datalist id="school-list">{schoolOptions.map(s => <option key={s} value={s} />)}</datalist>
            </div>
            <div>
              <label htmlFor="f-date">Visit date</label>
              <input id="f-date" type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="f-metric">Metric</label>
              <input
                id="f-metric"
                list="metric-list"
                required
                autoComplete="off"
                placeholder="e.g. Attendance"
                value={form.metric}
                onChange={e => setForm(f => ({ ...f, metric: e.target.value }))}
              />
              <datalist id="metric-list">{metrics.map(m => <option key={m} value={m} />)}</datalist>
            </div>
            <div>
              <span className="label" id="status-label">Status <span className="pick-one">pick one</span></span>
              <div className="status-pick" role="radiogroup" aria-labelledby="status-label">
                {STATUSES.map(s => (
                  <label key={s}>
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      required={s === 'On track'}
                      checked={form.status === s}
                      onChange={() => setForm(f => ({ ...f, status: s }))}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="f-by">Visited by</label>
              <input
                id="f-by"
                list="staff-list"
                required
                autoComplete="off"
                value={form.visitedBy}
                onChange={e => setForm(f => ({ ...f, visitedBy: e.target.value }))}
              />
              <datalist id="staff-list">{staff.map(s => <option key={s} value={s} />)}</datalist>
            </div>
            <div>
              <label htmlFor="f-funder">Funder <span className="optional">(optional)</span></label>
              <input
                id="f-funder"
                list="funder-list"
                autoComplete="off"
                placeholder="e.g. William Penn Foundation"
                value={form.funder}
                onChange={e => setForm(f => ({ ...f, funder: e.target.value }))}
              />
              <datalist id="funder-list">{uniq([...FUNDERS, ...funders]).map(f => <option key={f} value={f} />)}</datalist>
            </div>
          </div>
          <div className="notes-field">
            <label htmlFor="f-notes">Notes</label>
            <textarea
              id="f-notes"
              placeholder="What you saw on the visit"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="row">
            <button type="submit" disabled={busy}>Save note</button>
            <span className="msg" aria-live="polite">{busy ? 'Saving…' : message}</span>
          </div>
        </form>
      </section>
      </div>

      <div className="panel" hidden={tab !== 'reports'}>
        <Reports reports={reports} setReports={setReports} notes={notes} shown={shown} filters={filters} />
      </div>
    </main>
  );
}
