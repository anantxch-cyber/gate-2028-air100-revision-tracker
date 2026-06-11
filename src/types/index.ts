export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  dateStarted: string | null;
  dateCompleted: string | null;
  confidenceLevel: number;
  pyqDone: boolean;
  notesReady: boolean;
  shortNotesReady: boolean;
}

export interface Revision {
  id: string;
  topicId: string;
  subjectId: string;
  topicName: string;
  subjectName: string;
  revisionNumber: number;
  dueDate: string;
  completedDate: string | null;
  status: 'pending' | 'completed' | 'overdue';
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  topics: Topic[];
  hoursStudied: number;
  notesLink: string;
  pyqStatus: 'not-started' | 'in-progress' | 'completed';
  shortNotesStatus: 'not-started' | 'in-progress' | 'completed';
  mockTestStatus: 'not-started' | 'in-progress' | 'completed';
}

export interface MockTest {
  id: string;
  testName: string;
  date: string;
  marks: number;
  totalMarks: number;
  rank: number | null;
  accuracy: number;
  timeTaken: number;
  subjectId?: string;
}

export interface PYQEntry {
  id: string;
  subjectId: string;
  subjectName: string;
  year: number;
  completed: boolean;
  accuracy: number | null;
}

export interface DSAProblem {
  id: string;
  platform: 'leetcode' | 'codeforces' | 'geeksforgeeks';
  problemName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  solved: boolean;
  date: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  date: string;
  hours: number;
}

export interface Milestone {
  id: string;
  title: string;
  targetHours: number;
  achieved: boolean;
  achievedDate: string | null;
}

export interface AppState {
  subjects: Subject[];
  revisions: Revision[];
  mockTests: MockTest[];
  pyqEntries: PYQEntry[];
  dsaProblems: DSAProblem[];
  studySessions: StudySession[];
  milestones: Milestone[];
  streak: number;
  lastStudyDate: string | null;
  dailyGoal: {
    subject: string;
    dsaTarget: number;
    gateGoal: string;
  };
}

export type TabType = 'dashboard' | 'subjects' | 'revisions' | 'calendar' | 'analytics' | 'mock-tests' | 'pyq' | 'dsa' | 'motivation';
