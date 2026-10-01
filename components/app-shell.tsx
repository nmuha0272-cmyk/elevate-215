'use client';

import { useState } from 'react';
import VisitNotes from '@/components/visit-notes';
import type { Note } from '@/lib/note';
import { isWaiting, type Report } from '@/lib/report';

export type Tab = 'dashboard' | 'notes' | 'add' | 'reports';

const TABS: { id: Tab; label: string; blurb: string; crumb: string; glyph: string }[] = [
  { id: 'dashboard', label: 'Dashboard', blurb: 'What the notes add up to', crumb: 'Overview', glyph: '◈' },
  { id: 'notes', label: 'Notes', blurb: 'Look notes up and filter them', crumb: 'Find notes', glyph: '✎' },
  { id: 'add', label: 'Add a note', blurb: 'Log one school visit', crumb: 'New visit note', glyph: '+' },
  { id: 'reports', label: 'Reports', blurb: 'Send notes to a funder, review them', crumb: 'Waiting on review', glyph: '☑' },
];

export default function AppShell({ notes: initialNotes, reports: initialReports, schools }: { notes: Note[]; reports: Report[]; schools: string[] }) {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [search, setSearch] = useState('');
  const [reports, setReports] = useState<Report[]>(initialReports);

  const waiting = reports.filter(isWaiting).length;
  const current = TABS.find(t => t.id === tab)!;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <svg className="logo" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="logo-fill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--c-cyan)" />
                <stop offset="55%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--c-purple)" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="9" fill="url(#logo-fill)" />
            <path d="M7 22.5 13 15.5 17.5 19 25 9.5" fill="none" stroke="var(--accent-fg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="brand-name">Elevate 215</p>
            <p className="brand-sub">Visit notes · no login, everyone sees the same notes</p>
          </div>
        </div>
        <div className="topbar-tools">
          <input
            type="search"
            className="topsearch"
            placeholder="Search notes…"
            aria-label="Search words in notes"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              if (e.target.value && tab !== 'notes') setTab('notes');
            }}
          />
          <button
            type="button"
            className="bell"
            aria-label={waiting > 0 ? `${waiting} report${waiting === 1 ? '' : 's'} waiting on review` : 'Nothing waiting on review'}
            onClick={() => setTab('reports')}
          >
            <span aria-hidden="true">◔</span>
            {waiting > 0 && <span className="badge">{waiting}</span>}
          </button>
        </div>
      </header>

      <nav className="tabs" aria-label="Sections">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            className="tab-link"
            title={t.blurb}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-glyph" aria-hidden="true">{t.glyph}</span>
            <span className="tab-label">{t.label}</span>
            {t.id === 'reports' && waiting > 0 && <span className="count">{waiting}</span>}
          </button>
        ))}
      </nav>

      <p className="crumb"><span>{current.label}</span> / {current.crumb}</p>

      <VisitNotes
        initialNotes={initialNotes}
        schools={schools}
        tab={tab}
        search={search}
        setSearch={setSearch}
        reports={reports}
        setReports={setReports}
      />
    </div>
  );
}
