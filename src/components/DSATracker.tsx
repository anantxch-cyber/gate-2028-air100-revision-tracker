import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Flame, Code2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const PLATFORMS = [
  { value: 'leetcode', label: 'LeetCode', color: '#f59e0b' },
  { value: 'codeforces', label: 'Codeforces', color: '#3b82f6' },
  { value: 'geeksforgeeks', label: 'GeeksForGeeks', color: '#22c55e' },
] as const;

const DIFF_COLORS = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };

export function DSATracker() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    platform: 'leetcode' as 'leetcode' | 'codeforces' | 'geeksforgeeks',
    problemName: '', difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  });

  const handleAdd = () => {
    if (!form.problemName) return;
    dispatch({
      type: 'ADD_DSA_PROBLEM',
      payload: { ...form, solved: true, date: format(new Date(), 'yyyy-MM-dd') },
    });
    setForm({ platform: 'leetcode', problemName: '', difficulty: 'medium' });
    setShowForm(false);
  };

  const problems = state.dsaProblems;
  const easy = problems.filter(p => p.difficulty === 'easy').length;
  const medium = problems.filter(p => p.difficulty === 'medium').length;
  const hard = problems.filter(p => p.difficulty === 'hard').length;
  const total = problems.length;

  const platformData = useMemo(() =>
    PLATFORMS.map(p => ({ name: p.label, value: problems.filter(pr => pr.platform === p.value).length, color: p.color })).filter(p => p.value > 0),
    [problems]);

  const diffData = [
    { name: 'Easy', value: easy, color: DIFF_COLORS.easy },
    { name: 'Medium', value: medium, color: DIFF_COLORS.medium },
    { name: 'Hard', value: hard, color: DIFF_COLORS.hard },
  ].filter(d => d.value > 0);

  // Calculate streak
  const streak = useMemo(() => {
    if (problems.length === 0) return 0;
    const dates = [...new Set(problems.map(p => p.date))].sort().reverse();
    let s = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    let checkDate = today;
    for (const d of dates) {
      if (d === checkDate) {
        s++;
        const prev = new Date(checkDate);
        prev.setDate(prev.getDate() - 1);
        checkDate = format(prev, 'yyyy-MM-dd');
      } else if (d < checkDate) break;
    }
    return s;
  }, [problems]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold">DSA Tracker</motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-text-muted text-sm mt-1">Track your problem-solving progress</motion.p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Log Problem</button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label className="text-xs text-text-muted block mb-1">Problem Name</label><input className="input-field" value={form.problemName} onChange={e => setForm(p => ({ ...p, problemName: e.target.value }))} /></div>
            <div><label className="text-xs text-text-muted block mb-1">Platform</label>
              <select className="select-field" value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value as any }))}>
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-text-muted block mb-1">Difficulty</label>
              <select className="select-field" value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty: e.target.value as any }))}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={handleAdd}>Save</button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 text-center">
          <Code2 size={16} className="text-accent mx-auto mb-1" />
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-text-muted">Total Solved</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-success">{easy}</p>
          <p className="text-xs text-text-muted">Easy</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-warning">{medium}</p>
          <p className="text-xs text-text-muted">Medium</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-danger">{hard}</p>
          <p className="text-xs text-text-muted">Hard</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 text-center">
          <Flame size={16} className="text-orange-400 mx-auto mb-1" />
          <p className="text-2xl font-bold">{streak}</p>
          <p className="text-xs text-text-muted">Day Streak</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">By Difficulty</h3>
          <div className="h-48">
            {diffData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={diffData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                    {diffData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #2a2a2e', borderRadius: '10px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-text-muted text-sm">No data</div>}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">By Platform</h3>
          <div className="h-48">
            {platformData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={platformData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                    {platformData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #2a2a2e', borderRadius: '10px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-text-muted text-sm">No data</div>}
          </div>
        </motion.div>
      </div>

      {/* Recent Problems */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">Recent Problems</h3>
        <div className="space-y-2">
          {problems.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">No problems logged yet</p>
          ) : (
            [...problems].reverse().slice(0, 20).map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-2 border border-border">
                <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: DIFF_COLORS[p.difficulty] }} />
                <span className="text-sm flex-1">{p.problemName}</span>
                <span className="text-xs text-text-muted">{PLATFORMS.find(pl => pl.value === p.platform)?.label}</span>
                <span className={`badge text-[11px] ${p.difficulty === 'easy' ? 'badge-success' : p.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'}`}>{p.difficulty}</span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
