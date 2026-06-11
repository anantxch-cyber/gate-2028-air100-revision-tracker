import { motion } from 'framer-motion';
import {
  BookOpen, CheckCircle2, Clock, AlertCircle, TrendingUp,
  Flame, Target, Zap, Star, Code2
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  calculateOverallProgress, getTotalStudyHours, getDueToday,
  getOverdue, getUpcoming, getMotivationalQuote, calculateStreak,
  getGATEReadiness
} from '@/utils/helpers';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export function Dashboard() {
  const { state } = useApp();
  const progress = calculateOverallProgress(state);
  const totalHours = getTotalStudyHours(state);
  const dueToday = getDueToday(state.revisions);
  const overdue = getOverdue(state.revisions);
  const upcoming = getUpcoming(state.revisions);
  const streak = calculateStreak(state);
  const readiness = getGATEReadiness(state);
  const quote = getMotivationalQuote();

  const totalSubjects = state.subjects.length;
  const completedSubjects = state.subjects.filter(
    s => s.topics.length > 0 && s.topics.every(t => t.dateCompleted)
  ).length;
  const inProgress = state.subjects.filter(
    s => s.topics.some(t => t.dateCompleted) && s.topics.some(t => !t.dateCompleted)
  ).length;

  // Last 7 days study data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const hours = state.studySessions
      .filter(s => s.date === dateStr)
      .reduce((sum, s) => sum + s.hours, 0);
    return { day: format(date, 'EEE'), hours };
  });

  const getStatusMessage = () => {
    if (readiness >= 80) return '🔥 You\'re on fire! AIR 100 is within reach!';
    if (readiness >= 60) return '💪 Great progress! Keep pushing harder!';
    if (readiness >= 40) return '📈 Building momentum. Stay consistent!';
    if (readiness >= 20) return '🚀 Just getting started. Every step counts!';
    return '🎯 Begin your journey to AIR 100 today!';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold"
          >
            Dashboard
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-muted text-sm mt-1"
          >
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20"
        >
          <Flame size={18} className="text-orange-400" />
          <span className="text-sm font-semibold text-orange-300">{streak} Day Streak</span>
        </motion.div>
      </div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-5 border-l-4 border-l-accent"
      >
        <p className="text-sm text-text-secondary italic leading-relaxed">"{quote}"</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Subjects', value: totalSubjects, icon: <BookOpen size={16} />, color: 'text-accent' },
          { label: 'Completed', value: completedSubjects, icon: <CheckCircle2 size={16} />, color: 'text-success' },
          { label: 'In Progress', value: inProgress, icon: <TrendingUp size={16} />, color: 'text-info' },
          { label: 'Due Today', value: dueToday.length, icon: <AlertCircle size={16} />, color: 'text-warning' },
          { label: 'Upcoming', value: upcoming.length.toString(), icon: <Clock size={16} />, color: 'text-text-secondary' },
          { label: 'Study Hours', value: totalHours.toFixed(1), icon: <Zap size={16} />, color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="glass-card stat-card"
          >
            <div className={`${stat.color} mb-1`}>{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AIR-100 Progress Meter */}
        <motion.div
          custom={6}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="glass-card p-6 lg:col-span-1 flex flex-col items-center justify-center"
        >
          <h3 className="text-sm font-semibold text-text-muted mb-6 uppercase tracking-wider">GATE Readiness</h3>
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle
                cx="64" cy="64" r="56"
                fill="none"
                stroke="rgba(99,102,241,0.1)"
                strokeWidth="10"
              />
              <motion.circle
                cx="64" cy="64" r="56"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 56}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - readiness / 100) }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold gradient-text">{readiness}%</span>
              <span className="text-[11px] text-text-muted mt-1">Ready</span>
            </div>
          </div>
          <p className="text-sm text-text-secondary mt-4 text-center">{getStatusMessage()}</p>
          <div className="flex items-center gap-2 mt-3">
            <Target size={14} className="text-accent" />
            <span className="text-xs font-medium text-accent">Target: AIR &lt; 100</span>
          </div>
        </motion.div>

        {/* Daily Focus */}
        <motion.div
          custom={7}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="glass-card p-6 lg:col-span-1"
        >
          <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">Daily Focus</h3>
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-surface-2 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={14} className="text-accent" />
                <span className="text-xs text-text-muted font-medium">Today's Subject</span>
              </div>
              <p className="text-sm font-semibold">
                {state.dailyGoal.subject || state.subjects[new Date().getDay() % state.subjects.length]?.name || 'Set your focus'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-surface-2 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={14} className="text-warning" />
                <span className="text-xs text-text-muted font-medium">Revisions Due</span>
              </div>
              <p className="text-sm font-semibold">{dueToday.length} revision{dueToday.length !== 1 ? 's' : ''} today</p>
              {dueToday.slice(0, 3).map(r => (
                <p key={r.id} className="text-xs text-text-muted mt-1">• {r.topicName} (R{r.revisionNumber})</p>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-surface-2 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Code2 size={14} className="text-success" />
                <span className="text-xs text-text-muted font-medium">DSA Goal</span>
              </div>
              <p className="text-sm font-semibold">{state.dailyGoal.dsaTarget} problems today</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-2 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Target size={14} className="text-purple-400" />
                <span className="text-xs text-text-muted font-medium">GATE Goal</span>
              </div>
              <p className="text-sm font-semibold">{state.dailyGoal.gateGoal}</p>
            </div>
          </div>
        </motion.div>

        {/* Weekly Chart */}
        <motion.div
          custom={8}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="glass-card p-6 lg:col-span-1"
        >
          <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">This Week</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: '#18181b',
                    border: '1px solid #2a2a2e',
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value}h`, 'Study Hours']}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#areaGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-surface-2 text-center">
              <p className="text-lg font-bold">{last7Days.reduce((s, d) => s + d.hours, 0).toFixed(1)}h</p>
              <p className="text-[11px] text-text-muted">This Week</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-2 text-center">
              <p className="text-lg font-bold">{overdue.length}</p>
              <p className="text-[11px] text-text-muted text-danger">Overdue</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Subject Progress */}
      <motion.div
        custom={9}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="glass-card p-6"
      >
        <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">Subject Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {state.subjects.map(subject => {
            const total = subject.topics.length;
            const completed = subject.topics.filter(t => t.dateCompleted).length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            return (
              <div key={subject.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-border">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{ backgroundColor: subject.color + '20', color: subject.color }}
                >
                  {subject.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{subject.name}</span>
                    <span className="text-xs text-text-muted ml-2 shrink-0">{pct}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <motion.div
                      className="progress-bar-fill"
                      style={{ backgroundColor: subject.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
