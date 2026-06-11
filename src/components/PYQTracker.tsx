import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const YEARS = Array.from({ length: 15 }, (_, i) => 2024 - i);

export function PYQTracker() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subjectId: '', year: 2024, completed: false, accuracy: 0 });

  const handleAdd = () => {
    if (!form.subjectId) return;
    const subject = state.subjects.find(s => s.id === form.subjectId);
    dispatch({
      type: 'ADD_PYQ',
      payload: {
        subjectId: form.subjectId,
        subjectName: subject?.name || '',
        year: form.year,
        completed: form.completed,
        accuracy: form.completed ? form.accuracy : null,
      },
    });
    setForm({ subjectId: '', year: 2024, completed: false, accuracy: 0 });
    setShowForm(false);
  };

  const toggleComplete = (entry: typeof state.pyqEntries[0]) => {
    dispatch({
      type: 'UPDATE_PYQ',
      payload: { ...entry, completed: !entry.completed, accuracy: !entry.completed ? entry.accuracy : null },
    });
  };

  const grouped = useMemo(() => {
    const map: Record<string, typeof state.pyqEntries> = {};
    state.subjects.forEach(s => { map[s.name] = []; });
    state.pyqEntries.forEach(p => {
      if (!map[p.subjectName]) map[p.subjectName] = [];
      map[p.subjectName].push(p);
    });
    return map;
  }, [state.pyqEntries, state.subjects]);

  const total = state.pyqEntries.length;
  const completed = state.pyqEntries.filter(p => p.completed).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold">PYQ Tracker</motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-text-muted text-sm mt-1">Track previous year question completion</motion.p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Add PYQ</button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted block mb-1">Subject</label>
              <select className="select-field" value={form.subjectId} onChange={e => setForm(p => ({ ...p, subjectId: e.target.value }))}>
                <option value="">Select...</option>
                {state.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Year</label>
              <select className="select-field" value={form.year} onChange={e => setForm(p => ({ ...p, year: Number(e.target.value) }))}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.completed} onChange={e => setForm(p => ({ ...p, completed: e.target.checked }))} className="w-4 h-4 rounded" />
              <label className="text-xs text-text-muted">Completed</label>
            </div>
            {form.completed && (
              <div>
                <label className="text-xs text-text-muted block mb-1">Accuracy %</label>
                <input type="number" className="input-field" value={form.accuracy} onChange={e => setForm(p => ({ ...p, accuracy: Number(e.target.value) }))} />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={handleAdd}>Save</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4"><p className="text-2xl font-bold text-accent">{total}</p><p className="text-xs text-text-muted">Total PYQs</p></div>
        <div className="glass-card p-4"><p className="text-2xl font-bold text-success">{completed}</p><p className="text-xs text-text-muted">Completed</p></div>
        <div className="glass-card p-4"><p className="text-2xl font-bold text-warning">{pct}%</p><p className="text-xs text-text-muted">Completion</p></div>
      </div>

      {/* Subject-wise Progress */}
      <div className="space-y-3">
        {Object.entries(grouped).map(([subjectName, entries]) => {
          if (entries.length === 0) return null;
          const done = entries.filter(e => e.completed).length;
          const pctDone = Math.round((done / entries.length) * 100);
          const subject = state.subjects.find(s => s.name === subjectName);
          return (
            <motion.div key={subjectName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject?.color }} />
                  <span className="text-sm font-semibold">{subjectName}</span>
                </div>
                <span className="text-xs text-text-muted">{done}/{entries.length} · {pctDone}%</span>
              </div>
              <div className="progress-bar-bg mb-3">
                <div className="progress-bar-fill" style={{ width: `${pctDone}%`, backgroundColor: subject?.color }} />
              </div>
              <div className="flex flex-wrap gap-2">
                {entries.sort((a, b) => b.year - a.year).map(e => (
                  <button
                    key={e.id}
                    onClick={() => toggleComplete(e)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${e.completed ? 'bg-success/10 border-success/30 text-success' : 'bg-surface-2 border-border text-text-muted hover:border-border-hover'}`}
                  >
                    {e.completed && <Check size={10} className="inline mr-1" />}
                    {e.year}
                    {e.accuracy !== null && ` · ${e.accuracy}%`}
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
