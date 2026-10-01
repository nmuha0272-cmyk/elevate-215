import AppShell from '@/components/app-shell';
import { loadSchools } from '@/lib/schools';
import { readNotes, readReports } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [notes, reports, schools] = await Promise.all([readNotes(), readReports(), loadSchools()]);
  return <AppShell notes={notes} reports={reports} schools={schools} />;
}
