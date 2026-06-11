import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function MockTestTracker() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    testName: '', date: format(new Date(), 'yyyy-MM-dd'),
    marks: 0, totalMarks: 100, rank: '',
    accuracy: 0, timeTaken: 180,
  });

  const handleAdd = () => {
    if (!form.testName) return;
    dispatch({
      type: 'ADD_MOCK_TEST',
      payload: {
        testName: form.testName, date: form.date,
        marks: form.marks, totalMarks: form.totalMarks,
        rank: form.rank ? Number(form.rank) : null,
        accuracy: form.accuracy, timeTaken: form.timeTaken,
      },
    });
    setForm({ testName: '', date: format(new Date(), 'yyyy-MM-dd'), marks: 0, totalMarks: 100, rank: '', accuracy: 0, timeTaken: 180 });
    setShowForm(false);
  };

  const sorted = [...state.mockTests].sort((a, b) => a.date.localeCompare(b.date));
  const chartData = sorted.map(t => ({
    name: t.testName.substring(0, 10),
    marks: t.marks,
    accuracy: t.accuracy,
  }));

  const avgMarks = sorted.length > 0 ? sorted.reduce((s, t) => s + t.marks, 0) / sorted.length : 0;
  const avgAccuracy = sorted.length > 0 ? sorted.reduce((s, t) => s + t.accuracy, 0) / sorted.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold">Mock Tests</motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-text-muted text-sm mt-1">Track and analyze your mock test performance</motion.p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Add Test
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-card p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="text-xs text-text-muted block mb-1">Test Name</label><input className="input-field" value={form.testName} onChange={e => setForm(p => ({ ...p, testName: e.target.value }))} /></div>
                <div><label className="text-xs text-text-muted block mb-1">Date</label><input type="date" className="input-field" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
                <div><label className="text-xs text-text-muted block mb-1">Marks</label><input type="number" className="input-field" value={form.marks} onChange={e => setForm(p => ({ ...p, marks: Number(e.target.value) }))} /></div>
                <div><label className="text-xs text-text-muted block mb-1">Total Marks</label><input type="number" className="input-field" value={form.totalMarks} onChange={e => setForm(p => ({ ...p, totalMarks: Number(e.target.value) }))} /></div>
                <div><label className="text-xs text-text-muted block mb-1">Rank</label><input type="number" className="input-field" value={form.rank} onChange={e => setForm(p => ({ ...p, rank: e.target.value }))} placeholder="Optional" /></div>
                <div><label className="text-xs text-text-muted block mb-1">Accuracy %</label><input type="number" className="input-field" value={form.accuracy} onChange={e => setForm(p => ({ ...p, accuracy: Number(e.target.value) }))} /></div>
                <div><label className="text-xs text-text-muted block mb-1">Time (min)</label><input type="number" className="input-field" value={form.timeTaken} onChange={e => setForm(p => ({ ...p, timeTaken: Number(e.target.value) }))} /></div>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary" onClick={handleAdd}>Save</button>
                <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-accent">{sorted.length}</p>
          <p className="text-xs text-text-muted">Tests Taken</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-success">{avgMarks.toFixed(1)}</p>
          <p className="text-xs text-text-muted">Avg Marks</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-warning">{avgAccuracy.toFixed(1)}%</p>
          <p className="text-xs text-text-muted">Avg Accuracy</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">Performance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2e" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #2a2a2e', borderRadius: '10px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="marks" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Marks" />
                <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Test List */}
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <div className="glass-card p-8 text-center text-text-muted text-sm">No mock tests recorded yet</div>
        ) : (
          [...sorted].reverse().map((test, i) => (
            <motion.div key={test.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4 flex items-center gap-4 group">
              <div className="flex-1">
                <p className="text-sm font-semibold">{test.testName}</p>
                <p className="text-xs text-text-muted mt-1">{format(new Date(test.date), 'MMM d, yyyy')} · {test.timeTaken} min</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center"><p className="text-sm font-bold">{test.marks}/{test.totalMarks}</p><p className="text-[11px] text-text-muted">Marks</p></div>
                <div className="text-center"><p className="text-sm font-bold text-success">{test.accuracy}%</p><p className="text-[11px] text-text-muted">Accuracy</p></div>
                {test.rank && <div className="text-center"><p className="text-sm font-bold text-warning">#{test.rank}</p><p className="text-[11px] text-text-muted">Rank</p></div>}
                <button onClick={() => dispatch({ type: 'DELETE_MOCK_TEST', payload: test.id })} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
