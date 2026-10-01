import type { Note, Status } from './note';

type Seed = {
  school: string;
  date: string;
  metric: string;
  status: Status;
  notes: string;
  visitedBy: string;
  funder: string;
};

const SEEDS: Seed[] = [
  { school: 'CHRISTOPHER COLUMBUS CS', date: '2026-09-03', metric: 'Attendance', status: 'On track', visitedBy: 'Renée Okonkwo', funder: 'William Penn Foundation', notes: 'Students used weekly goal check-ins to improve attendance and follow-through on class expectations.' },
  { school: 'ESPERANZA ACADEMY CS', date: '2026-09-05', metric: 'Reading proficiency', status: 'On track', visitedBy: 'Marcus Feld', funder: 'Lenfest Institute', notes: 'Students revised their reading responses to cite stronger evidence from the text; comprehension checks improved week over week.' },
  { school: 'LINCOLN HS', date: '2026-09-11', metric: 'Chronic absenteeism', status: 'Off track', visitedBy: 'Renée Okonkwo', funder: 'William Penn Foundation', notes: 'Absence still above target; several students missing Monday sessions and not completing the make-up work.' },
  { school: 'KIPP PHILADELPHIA CS', date: '2026-09-14', metric: 'Math proficiency', status: 'On track', visitedBy: 'Marcus Feld', funder: 'Lenfest Institute', notes: 'Math growth checks improved after the new small-group block; most students moved up at least one band.' },
  { school: 'TACONY ACADEMY CS', date: '2026-09-17', metric: 'Reading proficiency', status: 'On track', visitedBy: 'Renée Okonkwo', funder: 'William Penn Foundation', notes: 'Students used AI as a reading aid, then checked each output against the source text and caught the errors themselves.' },
  { school: 'FREIRE CS', date: '2026-09-20', metric: 'Chronic absenteeism', status: 'Off track', visitedBy: 'Marcus Feld', funder: 'Lenfest Institute', notes: 'Attendance slipped again this month; the counselor flagged a group of students who have stopped coming in on Thursdays.' },
  { school: 'WISSAHICKON CS', date: '2026-09-23', metric: 'Math proficiency', status: 'On track', visitedBy: 'Renée Okonkwo', funder: 'William Penn Foundation', notes: 'Students explained their reasoning more clearly in math talk, using evidence from the problem rather than the answer alone.' },
  { school: 'NORTHWOOD ACADEMY CS', date: '2026-09-26', metric: 'Attendance', status: 'On track', visitedBy: 'Marcus Feld', funder: 'Lenfest Institute', notes: 'Staff and students mapped the daily attendance workflow and found where homeroom check-ins were slipping.' },
  { school: 'BELMONT CS', date: '2026-09-27', metric: 'Enrollment', status: 'Off track', visitedBy: 'Renée Okonkwo', funder: 'William Penn Foundation', notes: 'Enrollment follow-up is behind; the registrar still has families who never returned paperwork.' },
  { school: 'LEWIS C CASSIDY ACADEMICS PLUS SCH', date: '2026-09-29', metric: 'Chronic absenteeism', status: 'On track', visitedBy: 'Marcus Feld', funder: 'Lenfest Institute', notes: 'The school cleaned its attendance data and now reports chronic absence weekly to grade teams, which has helped them target outreach.' },
  { school: 'PHILADELPHIA ACADEMY CS', date: '2026-09-30', metric: 'Teacher retention', status: 'On track', visitedBy: 'Renée Okonkwo', funder: 'William Penn Foundation', notes: 'Discussed what makes a fair grade and how staff handle make-up work consistently; turnover in the department has been low this year.' },
];

export const SAMPLE_IDS = SEEDS.map((_, i) => `sample-${String(i).padStart(2, '0')}`);

export const isSample = (note: Note) => note.id.startsWith('sample-');

export function buildSampleNotes(): Note[] {
  return SEEDS.map((seed, i) => ({ ...seed, id: SAMPLE_IDS[i], notes: `[Sample] ${seed.notes}`, created: i + 1 }));
}
