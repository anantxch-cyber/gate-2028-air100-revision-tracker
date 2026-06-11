import type { AppState } from '@/types';
import { generateId } from '@/utils/helpers';

const SUBJECT_DATA = [
  { name: 'Engineering Mathematics', icon: '∑', color: '#6366f1' },
  { name: 'Discrete Mathematics', icon: '∀', color: '#8b5cf6' },
  { name: 'C Programming', icon: '{ }', color: '#06b6d4' },
  { name: 'Data Structures', icon: '🌳', color: '#10b981' },
  { name: 'Algorithms', icon: '⚡', color: '#f59e0b' },
  { name: 'Theory of Computation', icon: '∞', color: '#ef4444' },
  { name: 'Compiler Design', icon: '⚙️', color: '#ec4899' },
  { name: 'Digital Logic', icon: '⊕', color: '#14b8a6' },
  { name: 'Computer Organization & Architecture', icon: '🖥️', color: '#f97316' },
  { name: 'Operating Systems', icon: '💻', color: '#3b82f6' },
  { name: 'Database Management System', icon: '🗄️', color: '#a855f7' },
  { name: 'Computer Networks', icon: '🌐', color: '#22c55e' },
  { name: 'Aptitude', icon: '🧠', color: '#64748b' },
];

export function defaultState(): AppState {
  return {
    subjects: SUBJECT_DATA.map(s => ({
      id: generateId(),
      name: s.name,
      icon: s.icon,
      color: s.color,
      topics: [],
      hoursStudied: 0,
      notesLink: '',
      pyqStatus: 'not-started' as const,
      shortNotesStatus: 'not-started' as const,
      mockTestStatus: 'not-started' as const,
    })),
    revisions: [],
    mockTests: [],
    pyqEntries: [],
    dsaProblems: [],
    studySessions: [],
    milestones: [
      { id: generateId(), title: '100 Study Hours', targetHours: 100, achieved: false, achievedDate: null },
      { id: generateId(), title: '250 Study Hours', targetHours: 250, achieved: false, achievedDate: null },
      { id: generateId(), title: '500 Study Hours', targetHours: 500, achieved: false, achievedDate: null },
      { id: generateId(), title: '1000 Study Hours', targetHours: 1000, achieved: false, achievedDate: null },
    ],
    streak: 0,
    lastStudyDate: null,
    dailyGoal: {
      subject: '',
      dsaTarget: 5,
      gateGoal: 'Complete 2 topics and solve 10 PYQs',
    },
  };
}
