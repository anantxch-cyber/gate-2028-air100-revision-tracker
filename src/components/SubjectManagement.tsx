import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ChevronRight, ChevronDown, Trash2, Check, X,
  BookOpen, Clock, FileText, Edit3, ExternalLink
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { calculateSubjectProgress, generateId } from '@/utils/helpers';
import { format } from 'date-fns';
import type { Topic, Subject } from '@/types';

const statusLabels = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  'completed': 'Completed',
};

const statusColors = {
  'not-started': 'badge-neutral',
  'in-progress': 'badge-warning',
  'completed': 'badge-success',
};

export function SubjectManagement() {
  const { state, dispatch } = useApp();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [showAddTopic, setShowAddTopic] = useState<string | null>(null);
  const [showLogHours, setShowLogHours] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState({ name: '', confidenceLevel: 5 });
  const [logHours, setLogHours] = useState(1);

  const handleAddTopic = (subjectId: string) => {
    if (!newTopic.name.trim()) return;
    dispatch({
      type: 'ADD_TOPIC',
      payload: {
        subjectId,
        topic: {
          name: newTopic.name,
          dateStarted: format(new Date(), 'yyyy-MM-dd'),
          dateCompleted: null,
          confidenceLevel: newTopic.confidenceLevel,
          pyqDone: false,
          notesReady: false,
          shortNotesReady: false,
        },
      },
    });
    setNewTopic({ name: '', confidenceLevel: 5 });
    setShowAddTopic(null);
  };

  const handleCompleteTopic = (subjectId: string, topicId: string) => {
    dispatch({ type: 'COMPLETE_TOPIC', payload: { subjectId, topicId } });
  };

  const handleLogHours = (subjectId: string) => {
    dispatch({
      type: 'ADD_STUDY_SESSION',
      payload: {
        subjectId,
        date: format(new Date(), 'yyyy-MM-dd'),
        hours: logHours,
      },
    });
    dispatch({ type: 'CHECK_MILESTONES' });
    setShowLogHours(null);
    setLogHours(1);
  };

  const updateSubjectStatus = (subjectId: string, field: string, value: string) => {
    dispatch({
      type: 'UPDATE_SUBJECT',
      payload: { id: subjectId, [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold"
        >
          Subject Management
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-text-muted text-sm mt-1"
        >
          Track progress across all 13 GATE CSE subjects
        </motion.p>
      </div>

      <div className="space-y-3">
        {state.subjects.map((subject, i) => {
          const progress = calculateSubjectProgress(subject);
          const isExpanded = expandedSubject === subject.id;
          const totalTopics = subject.topics.length;
          const completedTopics = subject.topics.filter(t => t.dateCompleted).length;

          return (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card overflow-hidden"
            >
              {/* Subject Header */}
              <button
                className="w-full p-4 flex items-center gap-4 text-left"
                onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: subject.color + '20', color: subject.color }}
                >
                  {subject.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm truncate">{subject.name}</span>
                    <div className="flex items-center gap-3 ml-2 shrink-0">
                      <span className="text-xs text-text-muted">{completedTopics}/{totalTopics} topics</span>
                      <span className="text-sm font-bold" style={{ color: subject.color }}>{progress}%</span>
                    </div>
                  </div>
                  <div className="progress-bar-bg">
                    <motion.div
                      className="progress-bar-fill"
                      style={{ backgroundColor: subject.color }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  className="text-text-muted shrink-0"
                >
                  <ChevronRight size={16} />
                </motion.div>
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4">
                      {/* Stats Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-3 rounded-lg bg-surface-2 text-center">
                          <p className="text-lg font-bold">{subject.hoursStudied.toFixed(1)}h</p>
                          <p className="text-[11px] text-text-muted">Hours Studied</p>
                        </div>
                        <div className="p-3 rounded-lg bg-surface-2">
                          <p className="text-xs text-text-muted mb-1">PYQ Status</p>
                          <select
                            className="select-field !py-1 !text-xs"
                            value={subject.pyqStatus}
                            onChange={e => updateSubjectStatus(subject.id, 'pyqStatus', e.target.value)}
                          >
                            <option value="not-started">Not Started</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                        <div className="p-3 rounded-lg bg-surface-2">
                          <p className="text-xs text-text-muted mb-1">Short Notes</p>
                          <select
                            className="select-field !py-1 !text-xs"
                            value={subject.shortNotesStatus}
                            onChange={e => updateSubjectStatus(subject.id, 'shortNotesStatus', e.target.value)}
                          >
                            <option value="not-started">Not Started</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                        <div className="p-3 rounded-lg bg-surface-2">
                          <p className="text-xs text-text-muted mb-1">Mock Test</p>
                          <select
                            className="select-field !py-1 !text-xs"
                            value={subject.mockTestStatus}
                            onChange={e => updateSubjectStatus(subject.id, 'mockTestStatus', e.target.value)}
                          >
                            <option value="not-started">Not Started</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="btn-primary text-xs !py-2 !px-3"
                          onClick={() => setShowAddTopic(subject.id)}
                        >
                          <Plus size={14} /> Add Topic
                        </button>
                        <button
                          className="btn-secondary text-xs !py-2 !px-3"
                          onClick={() => setShowLogHours(subject.id)}
                        >
                          <Clock size={14} /> Log Hours
                        </button>
                      </div>

                      {/* Add Topic Form */}
                      <AnimatePresence>
                        {showAddTopic === subject.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-3">
                              <input
                                type="text"
                                placeholder="Topic name..."
                                className="input-field"
                                value={newTopic.name}
                                onChange={e => setNewTopic(prev => ({ ...prev, name: e.target.value }))}
                                onKeyDown={e => e.key === 'Enter' && handleAddTopic(subject.id)}
                                autoFocus
                              />
                              <div className="flex items-center gap-3">
                                <label className="text-xs text-text-muted">Confidence (1-10):</label>
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={newTopic.confidenceLevel}
                                  onChange={e => setNewTopic(prev => ({ ...prev, confidenceLevel: Number(e.target.value) }))}
                                  className="flex-1"
                                />
                                <span className="text-sm font-bold w-6 text-center">{newTopic.confidenceLevel}</span>
                              </div>
                              <div className="flex gap-2">
                                <button className="btn-primary text-xs !py-2" onClick={() => handleAddTopic(subject.id)}>
                                  <Check size={14} /> Add
                                </button>
                                <button className="btn-secondary text-xs !py-2" onClick={() => setShowAddTopic(null)}>
                                  <X size={14} /> Cancel
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Log Hours Form */}
                      <AnimatePresence>
                        {showLogHours === subject.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 rounded-xl bg-surface-2 border border-border">
                              <div className="flex items-center gap-3">
                                <input
                                  type="number"
                                  min="0.5"
                                  step="0.5"
                                  value={logHours}
                                  onChange={e => setLogHours(Number(e.target.value))}
                                  className="input-field w-24"
                                />
                                <span className="text-sm text-text-muted">hours</span>
                                <button className="btn-primary text-xs !py-2" onClick={() => handleLogHours(subject.id)}>
                                  <Check size={14} /> Log
                                </button>
                                <button className="btn-secondary text-xs !py-2" onClick={() => setShowLogHours(null)}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Topics List */}
                      {subject.topics.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Topics</h4>
                          {subject.topics.map(topic => (
                            <TopicRow
                              key={topic.id}
                              topic={topic}
                              subject={subject}
                              onComplete={() => handleCompleteTopic(subject.id, topic.id)}
                              onDelete={() => dispatch({ type: 'DELETE_TOPIC', payload: { subjectId: subject.id, topicId: topic.id } })}
                              onUpdate={(updated) => dispatch({ type: 'UPDATE_TOPIC', payload: { subjectId: subject.id, topic: updated } })}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function TopicRow({ topic, subject, onComplete, onDelete, onUpdate }: {
  topic: Topic;
  subject: Subject;
  onComplete: () => void;
  onDelete: () => void;
  onUpdate: (t: Topic) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-0/50 border border-border/50 group">
      {!topic.dateCompleted ? (
        <button
          onClick={onComplete}
          className="w-5 h-5 rounded-full border-2 border-border hover:border-success hover:bg-success/20 transition-colors shrink-0"
        />
      ) : (
        <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center shrink-0">
          <Check size={12} className="text-success" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${topic.dateCompleted ? 'text-text-muted line-through' : ''}`}>
          {topic.name}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="text-[11px] text-text-muted">
            Confidence: {topic.confidenceLevel}/10
          </span>
          <button
            onClick={() => onUpdate({ ...topic, pyqDone: !topic.pyqDone })}
            className={`text-[11px] px-2 py-0.5 rounded-full ${topic.pyqDone ? 'badge-success' : 'badge-neutral'}`}
          >
            PYQ {topic.pyqDone ? '✓' : '✗'}
          </button>
          <button
            onClick={() => onUpdate({ ...topic, notesReady: !topic.notesReady })}
            className={`text-[11px] px-2 py-0.5 rounded-full ${topic.notesReady ? 'badge-success' : 'badge-neutral'}`}
          >
            Notes {topic.notesReady ? '✓' : '✗'}
          </button>
          <button
            onClick={() => onUpdate({ ...topic, shortNotesReady: !topic.shortNotesReady })}
            className={`text-[11px] px-2 py-0.5 rounded-full ${topic.shortNotesReady ? 'badge-success' : 'badge-neutral'}`}
          >
            Short Notes {topic.shortNotesReady ? '✓' : '✗'}
          </button>
        </div>
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition-all"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
