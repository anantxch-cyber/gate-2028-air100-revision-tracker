import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getDueToday, getOverdue, getUpcoming, formatDate } from '@/utils/helpers';
import type { Revision } from '@/types';

type FilterType = 'all' | 'due-today' | 'overdue' | 'upcoming' | 'completed';

export function RevisionTracker() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');

  const dueToday = getDueToday(state.revisions);
  const overdue = getOverdue(state.revisions);
  const upcoming = getUpcoming(state.revisions);
  const completed = state.revisions.filter(r => r.completedDate);

  const filteredRevisions = (() => {
    switch (filter) {
      case 'due-today': return dueToday;
      case 'overdue': return overdue;
      case 'upcoming': return upcoming;
      case 'completed': return completed;
      default: return [...overdue, ...dueToday, ...upcoming, ...completed];
    }
  })();

  const handleComplete = (revisionId: string) => {
    dispatch({ type: 'COMPLETE_REVISION', payload: { revisionId } });
  };

  const getRevisionLabel = (num: number) => {
    const labels = ['Same Day', '7 Days', '30 Days', '90 Days', '180 Days'];
    return labels[num - 1] || '';
  };

  const getStatusBadge = (revision: Revision) => {
    if (revision.completedDate) return <span className="badge badge-success">✓ Done</span>;
    if (overdue.includes(revision)) return <span className="badge badge-danger">Overdue</span>;
    if (dueToday.includes(revision)) return <span className="badge badge-warning">Due Today</span>;
    return <span className="badge badge-info">Upcoming</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold"
        >
          Revision Tracker
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-text-muted text-sm mt-1"
        >
          Spaced repetition at 0, 7, 30, 90, and 180 days
        </motion.p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Due Today', value: dueToday.length, color: 'text-warning', bgColor: 'bg-warning/10', icon: <Clock size={16} /> },
          { label: 'Overdue', value: overdue.length, color: 'text-danger', bgColor: 'bg-danger/10', icon: <AlertTriangle size={16} /> },
          { label: 'Upcoming', value: upcoming.length, color: 'text-info', bgColor: 'bg-info/10', icon: <Clock size={16} /> },
          { label: 'Completed', value: completed.length, color: 'text-success', bgColor: 'bg-success/10', icon: <CheckCircle2 size={16} /> },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4"
          >
            <div className={`${stat.color} mb-2`}>{stat.icon}</div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'due-today', 'overdue', 'upcoming', 'completed'] as FilterType[]).map(f => (
          <button
            key={f}
            className={`tab-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'due-today' ? 'Due Today' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'overdue' && overdue.length > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-danger/20 text-danger text-[11px] inline-flex items-center justify-center">
                {overdue.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Revision List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredRevisions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-8 text-center"
            >
              <p className="text-text-muted text-sm">
                {filter === 'all'
                  ? 'No revisions yet. Complete topics to generate revision schedules.'
                  : `No ${filter.replace('-', ' ')} revisions.`}
              </p>
            </motion.div>
          ) : (
            filteredRevisions.map((revision, i) => (
              <motion.div
                key={revision.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.02 }}
                className="glass-card p-4 flex items-center gap-4"
              >
                {!revision.completedDate ? (
                  <button
                    onClick={() => handleComplete(revision.id)}
                    className="w-6 h-6 rounded-full border-2 border-border hover:border-success hover:bg-success/20 transition-colors shrink-0 flex items-center justify-center"
                  >
                    <Check size={12} className="text-transparent hover:text-success" />
                  </button>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                    <Check size={14} className="text-success" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${revision.completedDate ? 'line-through text-text-muted' : ''}`}>
                      {revision.topicName}
                    </span>
                    <span className="badge badge-neutral text-[11px]">R{revision.revisionNumber} · {getRevisionLabel(revision.revisionNumber)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-text-muted">{revision.subjectName}</span>
                    <span className="text-xs text-text-muted">Due: {formatDate(revision.dueDate)}</span>
                  </div>
                </div>
                {getStatusBadge(revision)}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
