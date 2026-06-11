import type { AppState } from '@/types';
import { defaultState } from '@/data/defaults';

const STORAGE_KEY = 'gate-2028-tracker';

export function loadState(): AppState {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return defaultState();
    const parsed = JSON.parse(serialized);
    // Merge with defaults to handle new fields
    const defaults = defaultState();
    return {
      ...defaults,
      ...parsed,
      subjects: parsed.subjects || defaults.subjects,
      milestones: parsed.milestones || defaults.milestones,
    };
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function exportJSON(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gate-2028-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data as AppState);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function exportCSV(state: AppState): void {
  // Create a comprehensive CSV with subject progress
  let csv = 'Subject,Progress %,Hours Studied,Topics Count,PYQ Status,Notes Status,Mock Status\n';
  state.subjects.forEach(s => {
    const total = s.topics.length;
    const completed = s.topics.filter(t => t.dateCompleted).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    csv += `"${s.name}",${pct},${s.hoursStudied},${total},${s.pyqStatus},${s.shortNotesStatus},${s.mockTestStatus}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gate-2028-report-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
