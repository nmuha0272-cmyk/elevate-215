'use client';

import { arcPath, areaPath, linePath, scale } from '@/lib/charts';
import { monthKeys, newSchoolsByMonth, notesByMonth, offTrackByMonth, pct, reportsByMonth, statusSplit, type Point } from '@/lib/stats';
import type { Note } from '@/lib/note';
import type { Report } from '@/lib/report';
import { isWaiting } from '@/lib/report';

type Card = { label: string; value: string; sub: string; points: Point[]; tone: string; glyph: string };

const TONES: Record<string, string> = { cyan: 'var(--c-cyan)', green: 'var(--c-green)', gold: 'var(--c-gold)', pink: 'var(--c-pink)' };

const fmtDay = (iso: string) => new Date(`${iso}T00:00`).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

function Spark({ points, tone }: { points: Point[]; tone: string }) {
  const { points: pts } = scale(points.map(p => p.count), 96, 3);
  const flat = points.every(p => p.count === points[0].count);
  const line = flat ? pts.map(p => ({ x: p.x, y: 10 })) : pts;
  const end = line[line.length - 1];
  return (
    <svg className="spark" viewBox="0 0 96 20" aria-hidden="true">
      <path d={areaPath(line, 19)} fill={tone} opacity=".16" />
      <path d={linePath(line)} fill="none" stroke={tone} strokeWidth="1.75" strokeLinecap="round" />
      <circle cx={end.x} cy={end.y} r="2.5" fill={tone} />
    </svg>
  );
}

function StatCards({ notes, reports }: { notes: Note[]; reports: Report[] }) {
  const keys = monthKeys();
  const offTrack = notes.filter(n => n.status === 'Off track').length;
  const schools = new Set(notes.map(n => n.school)).size;
  const waiting = reports.filter(isWaiting).length;
  const dates = notes.map(n => n.date).sort();
  const span = dates.length ? `${fmtDay(dates[0])} – ${fmtDay(dates[dates.length - 1])}` : 'no visits yet';

  const cards: Card[] = [
    { label: 'Notes logged', value: String(notes.length), sub: notes.length ? `across ${schools} school${schools === 1 ? '' : 's'}` : 'nothing logged yet', points: notesByMonth(notes, keys), tone: 'cyan', glyph: '✎' },
    { label: 'Off track', value: String(offTrack), sub: notes.length ? `${pct(offTrack, notes.length)}% of notes` : 'no notes yet', points: offTrackByMonth(notes, keys), tone: 'pink', glyph: '!' },
    { label: 'Schools visited', value: String(schools), sub: span, points: newSchoolsByMonth(notes, keys), tone: 'green', glyph: '⌂' },
    { label: 'Reports waiting', value: String(waiting), sub: `${reports.length} report${reports.length === 1 ? '' : 's'} total`, points: reportsByMonth(reports, keys), tone: 'gold', glyph: '☑' },
  ];

  return (
    <div className="cards">
      {cards.map(c => (
        <article key={c.label} className="card stat">
          <span className="icon" style={{ background: TONES[c.tone] }} aria-hidden="true">{c.glyph}</span>
          <div>
            <p className="stat-value">{c.value}</p>
            <p className="stat-label">{c.label}</p>
            <p className="stat-sub">{c.sub}</p>
          </div>
          <Spark points={c.points} tone={TONES[c.tone]} />
        </article>
      ))}
    </div>
  );
}

function AreaChart({ notes }: { notes: Note[] }) {
  const points = notesByMonth(notes, monthKeys(8));
  const { points: pts, max } = scale(points.map(p => p.count), 520, 26);
  const last = pts[pts.length - 1];
  const empty = notes.length === 0;

  return (
    <article className="card panel-card">
      <header className="card-head">
        <h2>Visit notes over time</h2>
        <p className="card-sub">Notes logged per month, from the visit date. Peak {max}.</p>
      </header>
      {empty ? (
        <p className="empty">No notes yet, so there is nothing to chart.</p>
      ) : (
        <>
          <svg className="area" viewBox="0 0 520 190" role="img" aria-label={`Notes per month, ${points.map(p => `${p.label} ${p.count}`).join(', ')}`}>
            {[0, 0.5, 1].map(f => (
              <line key={f} x1="26" x2="520" y1={190 - f * 164} y2={190 - f * 164} className="grid-line" />
            ))}
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--c-cyan)" stopOpacity=".45" />
                <stop offset="100%" stopColor="var(--c-cyan)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath(pts, 190)} fill="url(#areaFill)" />
            <path d={linePath(pts)} fill="none" stroke="var(--c-cyan)" strokeWidth="2.5" strokeLinecap="round" />
            {pts.map((p, i) => (
              <text key={points[i].key} x={p.x} y="188" className="axis" textAnchor="middle">{points[i].label}</text>
            ))}
            <circle cx={last.x} cy={last.y} r="5" fill="var(--c-cyan)" />
            <circle cx={last.x} cy={last.y} r="9" fill="var(--c-cyan)" opacity=".3" />
          </svg>
        </>
      )}
    </article>
  );
}

function Donut({ notes }: { notes: Note[] }) {
  const slices = statusSplit(notes);
  const total = slices.reduce((a, s) => a + s.count, 0);
  let cursor = 0;

  return (
    <article className="card panel-card">
      <header className="card-head">
        <h2>Status breakdown</h2>
        <p className="card-sub">Every note, on or off track, or failed.</p>
      </header>
      {total === 0 ? (
        <p className="empty">No notes yet, so there is nothing to split.</p>
      ) : (
        <div className="donut-wrap">
          <svg className="donut" viewBox="0 0 120 120" role="img" aria-label={slices.map(s => `${s.label} ${s.count}`).join(', ')}>
            {slices.map(s => {
              const frac = s.count / total;
              const path = <path key={s.label} d={arcPath(60, 60, 52, 34, cursor, cursor + frac)} className={`arc ${s.cls}`} />;
              cursor += frac;
              return path;
            })}
            <text x="60" y="56" className="donut-value" textAnchor="middle">{total}</text>
            <text x="60" y="72" className="donut-caption" textAnchor="middle">notes</text>
          </svg>
          <ul className="legend">
            {slices.map(s => (
              <li key={s.label}><span className={`swatch ${s.cls}`} />{s.label}<strong>{pct(s.count, total)}%</strong><span className="cell-sub">{s.count} notes</span></li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export default function Dashboard({ notes, reports }: { notes: Note[]; reports: Report[] }) {
  return (
    <div className="dash">
      <StatCards notes={notes} reports={reports} />
      <div className="dash-panels">
        <AreaChart notes={notes} />
        <Donut notes={notes} />
      </div>
    </div>
  );
}
