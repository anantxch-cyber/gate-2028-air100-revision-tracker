import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { format, subDays, endOfWeek, eachWeekOfInterval, subWeeks } from 'date-fns';
import { useMemo } from 'react';
import { calculateSubjectProgress, getGATEReadiness } from '@/utils/helpers';

const tooltipStyle = {
  background: '#18181b', border: '1px solid #2a2a2e',
  borderRadius: '10px', fontSize: '12px',
};

export function StudyAnalytics() {
  const { state } = useApp();
  const totalHours = state.studySessions.reduce((sum, s) => sum + s.hours, 0);
  const readiness = getGATEReadiness(state);
  const revisionRate = state.revisions.length > 0
    ? Math.round((state.revisions.filter(r => r.completedDate).length / state.revisions.length) * 100) : 0;

  const weeklyData = useMemo(() => {
    const weeks = eachWeekOfInterval({ start: subWeeks(new Date(), 7), end: new Date() });
    return weeks.map(ws => {
      const we = endOfWeek(ws);
      const hours = state.studySessions.filter(s => { const d = new Date(s.date); return d >= ws && d <= we; }).reduce((sum, s) => sum + s.hours, 0);
      return { week: format(ws, 'MMM d'), hours: Math.round(hours * 10) / 10 };
    });
  }, [state.studySessions]);

  const subjectDist = useMemo(() =>
    state.subjects.map(s => ({ name: s.name.substring(0, 15), hours: s.hoursStudied, color: s.color })).filter(s => s.hours > 0).sort((a, b) => b.hours - a.hours),
    [state.subjects]);

  const radarData = useMemo(() =>
    state.subjects.map(s => ({ subject: s.name.substring(0, 12), progress: calculateSubjectProgress(s) })),
    [state.subjects]);

  const dailyData = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      return { day: format(date, 'MMM d'), hours: state.studySessions.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.hours, 0) };
    }),
    [state.studySessions]);

  const sorted = state.subjects.filter(s => s.topics.length > 0).map(s => ({
    name: s.name, progress: calculateSubjectProgress(s), color: s.color,
  })).sort((a, b) => b.progress - a.progress);
  const strong = sorted.slice(0, 4);
  const weak = sorted.slice(-4).reverse();

  return (
    <div className="space-y-6">
      <div>
        <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold">Study Analytics</motion.h2>
        <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-text-muted text-sm mt-1">Deep insights into your GATE preparation</motion.p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Hours', value: `${totalHours.toFixed(1)}h`, color: 'text-accent' },
          { label: 'Revision Rate', value: `${revisionRate}%`, color: 'text-success' },
          { label: 'GATE Readiness', value: `${readiness}%`, color: 'text-purple-400' },
          { label: 'Avg Hours/Day', value: `${(totalHours / 30).toFixed(1)}h`, color: 'text-warning' },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-text-muted mt-1">{m.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">Weekly Study Hours</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2e" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}h`, 'Hours']} />
                <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">Subject Distribution</h3>
          <div className="h-64">
            {subjectDist.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={subjectDist} dataKey="hours" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {subjectDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}h`, 'Hours']} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-text-muted text-sm">No data yet</div>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">Monthly Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2e" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}h`, 'Hours']} />
                <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">Progress Radar</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2a2a2e" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#71717a' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Progress" dataKey="progress" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-success mb-4 uppercase tracking-wider">💪 Strong Subjects</h3>
          <div className="space-y-3">
            {strong.length > 0 ? strong.map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-sm flex-1">{s.name}</span>
                <span className="text-sm font-bold text-success">{s.progress}%</span>
              </div>
            )) : <p className="text-sm text-text-muted">Complete topics to see</p>}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-sm font-semibold text-danger mb-4 uppercase tracking-wider">⚠️ Needs Attention</h3>
          <div className="space-y-3">
            {weak.length > 0 ? weak.map(s => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-sm flex-1">{s.name}</span>
                <span className="text-sm font-bold text-danger">{s.progress}%</span>
              </div>
            )) : <p className="text-sm text-text-muted">Complete topics to identify</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
