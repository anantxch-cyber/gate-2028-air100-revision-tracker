import { motion } from 'framer-motion';
import { Target, Flame, Trophy, Star, Award, Zap, Crown, Medal } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getMotivationalQuote, getTotalStudyHours, calculateStreak, calculateOverallProgress } from '@/utils/helpers';

const BADGE_ICONS = [
  { icon: <Star size={20} />, color: '#f59e0b' },
  { icon: <Award size={20} />, color: '#6366f1' },
  { icon: <Zap size={20} />, color: '#22c55e' },
  { icon: <Crown size={20} />, color: '#ec4899' },
];

export function Motivation() {
  const { state } = useApp();
  const quote = getMotivationalQuote();
  const totalHours = getTotalStudyHours(state);
  const streak = calculateStreak(state);
  const progress = calculateOverallProgress(state);

  const achievements = [
    { title: 'First Topic', desc: 'Complete your first topic', earned: state.subjects.some(s => s.topics.some(t => t.dateCompleted)) },
    { title: '7-Day Streak', desc: 'Study for 7 days in a row', earned: streak >= 7 },
    { title: '30-Day Streak', desc: 'Study for 30 days in a row', earned: streak >= 30 },
    { title: '50 DSA Problems', desc: 'Solve 50 DSA problems', earned: state.dsaProblems.length >= 50 },
    { title: '100 DSA Problems', desc: 'Solve 100 DSA problems', earned: state.dsaProblems.length >= 100 },
    { title: 'First Mock Test', desc: 'Take your first mock test', earned: state.mockTests.length >= 1 },
    { title: '10 Mock Tests', desc: 'Take 10 mock tests', earned: state.mockTests.length >= 10 },
    { title: 'Revision Master', desc: 'Complete 50 revisions', earned: state.revisions.filter(r => r.completedDate).length >= 50 },
    { title: 'Half Way', desc: '50% overall completion', earned: progress >= 50 },
    { title: 'All Subjects Started', desc: 'Add topics to all subjects', earned: state.subjects.every(s => s.topics.length > 0) },
    { title: 'PYQ Champion', desc: 'Complete 100 PYQ entries', earned: state.pyqEntries.filter(p => p.completed).length >= 100 },
    { title: 'Full Coverage', desc: '100% completion', earned: progress >= 100 },
  ];

  const earnedCount = achievements.filter(a => a.earned).length;

  return (
    <div className="space-y-6">
      <div>
        <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold">Motivation Hub</motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-text-muted text-sm mt-1">Stay focused on your AIR &lt; 100 goal</motion.p>
      </div>

      {/* Goal Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 text-center glow-accent relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-purple-500/5 to-pink-500/5" />
        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center mx-auto mb-4"
          >
            <Target size={36} className="text-white" />
          </motion.div>
          <h3 className="text-3xl font-bold gradient-text mb-2">AIR &lt; 100</h3>
          <p className="text-text-secondary text-sm">GATE CSE 2028 — Your dream rank awaits</p>
        </div>
      </motion.div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 border-l-4 border-l-purple-500"
      >
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Quote of the Day</h3>
        <p className="text-lg font-medium text-text-secondary italic leading-relaxed">"{quote}"</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5 text-center">
          <Flame size={24} className="text-orange-400 mx-auto mb-2" />
          <p className="text-3xl font-bold">{streak}</p>
          <p className="text-xs text-text-muted mt-1">Day Streak</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 text-center">
          <Trophy size={24} className="text-yellow-400 mx-auto mb-2" />
          <p className="text-3xl font-bold">{progress}%</p>
          <p className="text-xs text-text-muted mt-1">Overall Progress</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5 text-center">
          <Zap size={24} className="text-accent mx-auto mb-2" />
          <p className="text-3xl font-bold">{totalHours.toFixed(0)}</p>
          <p className="text-xs text-text-muted mt-1">Study Hours</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 text-center">
          <Medal size={24} className="text-green-400 mx-auto mb-2" />
          <p className="text-3xl font-bold">{earnedCount}/{achievements.length}</p>
          <p className="text-xs text-text-muted mt-1">Achievements</p>
        </motion.div>
      </div>

      {/* Milestones */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
        <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">Study Hour Milestones</h3>
        <div className="space-y-3">
          {state.milestones.map((m, i) => {
            const pct = Math.min(Math.round((totalHours / m.targetHours) * 100), 100);
            return (
              <div key={m.id} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.achieved ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20' : 'bg-surface-3'}`}>
                  {BADGE_ICONS[i % BADGE_ICONS.length].icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${m.achieved ? 'text-yellow-400' : ''}`}>{m.title}</span>
                    <span className="text-xs text-text-muted">{totalHours.toFixed(0)}/{m.targetHours}h</span>
                  </div>
                  <div className="progress-bar-bg">
                    <motion.div
                      className="progress-bar-fill"
                      style={{ backgroundColor: m.achieved ? '#f59e0b' : '#6366f1' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.1 * i }}
                    />
                  </div>
                </div>
                {m.achieved && <span className="text-yellow-400 text-sm">🏆</span>}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Achievement Badges */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
        <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">Achievement Badges</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {achievements.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.02 * i }}
              className={`p-4 rounded-xl border text-center transition-all ${a.earned
                ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                : 'bg-surface-2 border-border opacity-50'
              }`}
            >
              <div className="text-2xl mb-2">{a.earned ? '🏅' : '🔒'}</div>
              <p className="text-xs font-semibold">{a.title}</p>
              <p className="text-[11px] text-text-muted mt-1">{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
