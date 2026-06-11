import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, parseISO, isSameDay, subDays } from 'date-fns';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function RevisionCalendar() {
  const { state } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  // Build revision map for this month
  const revisionMap = useMemo(() => {
    const map: Record<string, { count: number; subjects: Set<string>; colors: string[] }> = {};
    state.revisions.forEach(r => {
      const key = r.dueDate;
      if (!map[key]) map[key] = { count: 0, subjects: new Set(), colors: [] };
      map[key].count++;
      map[key].subjects.add(r.subjectName);
      const subject = state.subjects.find(s => s.id === r.subjectId);
      if (subject && !map[key].colors.includes(subject.color)) {
        map[key].colors.push(subject.color);
      }
    });
    return map;
  }, [state.revisions, state.subjects]);

  // Study sessions heatmap data (last 365 days)
  const heatmapData = useMemo(() => {
    const map: Record<string, number> = {};
    state.studySessions.forEach(s => {
      map[s.date] = (map[s.date] || 0) + s.hours;
    });
    return map;
  }, [state.studySessions]);

  // Generate last ~20 weeks for heatmap
  const heatmapWeeks = useMemo(() => {
    const weeks: string[][] = [];
    const today = new Date();
    const start = subDays(today, 140); // ~20 weeks
    let currentWeek: string[] = [];
    
    // Pad start to Sunday
    const startDayOfWeek = getDay(start);
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push('');
    }
    
    for (let i = 0; i <= 140; i++) {
      const date = subDays(today, 140 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      currentWeek.push(dateStr);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, []);

  const getHeatmapColor = (hours: number) => {
    if (hours === 0) return 'bg-surface-3';
    if (hours < 1) return 'bg-accent/20';
    if (hours < 2) return 'bg-accent/40';
    if (hours < 4) return 'bg-accent/60';
    if (hours < 6) return 'bg-accent/80';
    return 'bg-accent';
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div className="space-y-6">
      <div>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold"
        >
          Revision Calendar
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-text-muted text-sm mt-1"
        >
          Visualize your revision schedule and study patterns
        </motion.p>
      </div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-surface-3 transition-colors"
          >
            <ChevronLeft size={18} className="text-text-muted" />
          </button>
          <h3 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-surface-3 transition-colors"
          >
            <ChevronRight size={18} className="text-text-muted" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs text-text-muted font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const revData = revisionMap[dateStr];
            const studyHours = heatmapData[dateStr] || 0;
            const today = isToday(day);

            return (
              <div
                key={dateStr}
                className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-center relative group cursor-default transition-colors
                  ${today ? 'bg-accent/10 border border-accent/30' : 'hover:bg-surface-3'}
                  ${studyHours > 0 ? 'bg-surface-3' : ''}
                `}
              >
                <span className={`text-xs font-medium ${today ? 'text-accent' : 'text-text-secondary'}`}>
                  {format(day, 'd')}
                </span>
                {revData && (
                  <div className="flex gap-0.5 mt-0.5">
                    {revData.colors.slice(0, 3).map((c, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                )}
                {/* Tooltip */}
                {(revData || studyHours > 0) && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-surface-2 border border-border rounded-lg p-2 text-xs whitespace-nowrap shadow-xl">
                      {studyHours > 0 && <p className="text-text-secondary">{studyHours}h studied</p>}
                      {revData && <p className="text-text-secondary">{revData.count} revision{revData.count !== 1 ? 's' : ''} due</p>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Study Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h3 className="text-sm font-semibold text-text-muted mb-4 uppercase tracking-wider">Study Heatmap</h3>
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {heatmapWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((dateStr, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={`heatmap-cell ${dateStr ? getHeatmapColor(heatmapData[dateStr] || 0) : 'bg-transparent'}`}
                    title={dateStr ? `${dateStr}: ${heatmapData[dateStr] || 0}h` : ''}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
          <span>Less</span>
          <div className="flex gap-1">
            {['bg-surface-3', 'bg-accent/20', 'bg-accent/40', 'bg-accent/60', 'bg-accent/80', 'bg-accent'].map(c => (
              <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </motion.div>
    </div>
  );
}
