const cell = (value: unknown) => {
  let s = String(value ?? '').replace(/"/g, '""');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s}"`;
};

export function toCsv(notes: { date: string; school: string; metric: string; status: string; funder: string; visitedBy: string; notes: string }[]): string {
  const header = ['Date', 'School', 'Metric', 'Status', 'Funder', 'Visited by', 'Notes'];
  return [header, ...notes.map(n => [n.date, n.school, n.metric, n.status, n.funder, n.visitedBy, n.notes])]
    .map(row => row.map(cell).join(','))
    .join('\r\n');
}
