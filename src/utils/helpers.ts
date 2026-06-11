import { format, addDays, isToday, isBefore, isAfter, startOfDay, parseISO } from 'date-fns';
import type { Revision, Subject, Topic, AppState } from '@/types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function generateRevisions(topic: Topic, subject: Subject): Revision[] {
  if (!topic.dateCompleted) return [];
  const baseDate = parseISO(topic.dateCompleted);
  const intervals = [0, 7, 30, 90, 180];
  
  return intervals.map((days, index) => ({
    id: generateId() + index,
    topicId: topic.id,
    subjectId: subject.id,
    topicName: topic.name,
    subjectName: subject.name,
    revisionNumber: index + 1,
    dueDate: format(addDays(baseDate, days), 'yyyy-MM-dd'),
    completedDate: null,
    status: 'pending' as const,
  }));
}

export function getRevisionStatus(revision: Revision): 'pending' | 'completed' | 'overdue' {
  if (revision.completedDate) return 'completed';
  const due = startOfDay(parseISO(revision.dueDate));
  const today = startOfDay(new Date());
  if (isBefore(due, today)) return 'overdue';
  return 'pending';
}

export function updateRevisionStatuses(revisions: Revision[]): Revision[] {
  return revisions.map(r => ({
    ...r,
    status: r.completedDate ? 'completed' : getRevisionStatus(r),
  }));
}

export function getDueToday(revisions: Revision[]): Revision[] {
  return revisions.filter(r => !r.completedDate && isToday(parseISO(r.dueDate)));
}

export function getOverdue(revisions: Revision[]): Revision[] {
  const today = startOfDay(new Date());
  return revisions.filter(r => !r.completedDate && isBefore(parseISO(r.dueDate), today));
}

export function getUpcoming(revisions: Revision[]): Revision[] {
  const today = startOfDay(new Date());
  return revisions.filter(r => !r.completedDate && isAfter(parseISO(r.dueDate), today));
}

export function calculateSubjectProgress(subject: Subject): number {
  if (subject.topics.length === 0) return 0;
  const completed = subject.topics.filter(t => t.dateCompleted).length;
  return Math.round((completed / subject.topics.length) * 100);
}

export function calculateOverallProgress(state: AppState): number {
  const totalTopics = state.subjects.reduce((sum, s) => sum + s.topics.length, 0);
  const completedTopics = state.subjects.reduce(
    (sum, s) => sum + s.topics.filter(t => t.dateCompleted).length,
    0
  );
  if (totalTopics === 0) return 0;
  return Math.round((completedTopics / totalTopics) * 100);
}

export function getTotalStudyHours(state: AppState): number {
  return state.studySessions.reduce((sum, s) => sum + s.hours, 0);
}

export function getSubjectStudyHours(state: AppState, subjectId: string): number {
  return state.studySessions
    .filter(s => s.subjectId === subjectId)
    .reduce((sum, s) => sum + s.hours, 0);
}

export function calculateStreak(state: AppState): number {
  if (state.studySessions.length === 0) return 0;
  const sorted = [...state.studySessions].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  let currentDate = startOfDay(new Date());
  
  const dateSet = new Set(sorted.map(s => s.date));
  const todayStr = format(currentDate, 'yyyy-MM-dd');
  
  if (!dateSet.has(todayStr)) {
    const yesterdayStr = format(addDays(currentDate, -1), 'yyyy-MM-dd');
    if (!dateSet.has(yesterdayStr)) return 0;
    currentDate = addDays(currentDate, -1);
  }
  
  while (dateSet.has(format(currentDate, 'yyyy-MM-dd'))) {
    streak++;
    currentDate = addDays(currentDate, -1);
  }
  
  return streak;
}

export function getMotivationalQuote(): string {
  const quotes = [
    "The only way to do great work is to love what you do. — Steve Jobs",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. — Winston Churchill",
    "Discipline is the bridge between goals and accomplishment. — Jim Rohn",
    "The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt",
    "It does not matter how slowly you go as long as you do not stop. — Confucius",
    "AIR 100 is not a dream, it's a plan. Execute it daily.",
    "Every revision brings you closer to your GATE goal.",
    "Consistency beats intensity. Show up every single day.",
    "Your preparation today determines your rank tomorrow.",
    "The pain of discipline is nothing compared to the pain of regret.",
    "Focus on progress, not perfection. Every topic counts.",
    "You didn't come this far to only come this far.",
    "The expert in anything was once a beginner.",
    "Small daily improvements are the key to staggering long-term results.",
    "Dream is not what you see in sleep. Dream is something that does not let you sleep. — APJ Abdul Kalam",
    "Hard work beats talent when talent doesn't work hard.",
    "Believe you can and you're halfway there. — Theodore Roosevelt",
    "Your only limit is your mind. Push beyond it.",
    "GATE is not about being the smartest. It's about being the most prepared.",
    "One more problem. One more topic. One step closer to AIR 100.",
  ];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return quotes[dayOfYear % quotes.length];
}

export function formatDate(date: string): string {
  return format(parseISO(date), 'MMM dd, yyyy');
}

export function getGATEReadiness(state: AppState): number {
  const overallProgress = calculateOverallProgress(state);
  const totalHours = getTotalStudyHours(state);
  const revisionRate = state.revisions.length > 0
    ? (state.revisions.filter(r => r.completedDate).length / state.revisions.length) * 100
    : 0;
  const mockAvg = state.mockTests.length > 0
    ? state.mockTests.reduce((sum, m) => sum + (m.marks / m.totalMarks) * 100, 0) / state.mockTests.length
    : 0;
  
  // Weighted average
  const readiness = (overallProgress * 0.3) + (Math.min(totalHours / 10, 100) * 0.2) + (revisionRate * 0.25) + (mockAvg * 0.25);
  return Math.min(Math.round(readiness), 100);
}
