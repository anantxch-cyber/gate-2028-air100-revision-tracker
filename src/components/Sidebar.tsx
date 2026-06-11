import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, RefreshCw, Calendar, BarChart3,
  ClipboardList, FileText, Code2, Trophy, Download, Upload,
  Menu, X, Target, LogOut, Cloud
} from 'lucide-react';
import type { TabType } from '@/types';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { exportJSON, exportCSV, importJSON } from '@/utils/storage';
import { useRef } from 'react';

const NAV_ITEMS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'subjects', label: 'Subjects', icon: <BookOpen size={18} /> },
  { id: 'revisions', label: 'Revisions', icon: <RefreshCw size={18} /> },
  { id: 'calendar', label: 'Calendar', icon: <Calendar size={18} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  { id: 'mock-tests', label: 'Mock Tests', icon: <ClipboardList size={18} /> },
  { id: 'pyq', label: 'PYQ Tracker', icon: <FileText size={18} /> },
  { id: 'dsa', label: 'DSA Tracker', icon: <Code2 size={18} /> },
  { id: 'motivation', label: 'Motivation', icon: <Trophy size={18} /> },
];

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) {
  const { state, dispatch, syncing } = useApp();
  const { user, signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importJSON(file);
      dispatch({ type: 'SET_STATE', payload: data });
    } catch (err) {
      alert('Failed to import backup. Invalid file.');
    }
    e.target.value = '';
  };

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
              <Target size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-text-primary">GATE 2028</h1>
              <p className="text-[11px] text-text-muted font-medium">AIR-100 Tracker</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                onTabChange(item.id);
                onClose();
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          {syncing && (
            <div className="flex items-center gap-2 px-4 py-2 text-xs text-accent">
              <Cloud size={14} className="animate-pulse" />
              <span>Syncing...</span>
            </div>
          )}
          <button
            className="sidebar-nav-item"
            onClick={() => exportJSON(state)}
          >
            <Download size={16} />
            <span>Export JSON</span>
          </button>
          <button
            className="sidebar-nav-item"
            onClick={() => exportCSV(state)}
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button
            className="sidebar-nav-item"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} />
            <span>Import Backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {/* User Profile */}
        {user && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-3 px-2 py-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{user.displayName || 'User'}</p>
                <p className="text-[10px] text-text-muted truncate">{user.email}</p>
              </div>
              <button
                onClick={signOut}
                className="p-1.5 rounded-lg hover:bg-surface-3 text-text-muted hover:text-danger transition-colors"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-surface-1 border-b border-border z-30 flex items-center px-4 md:hidden">
      <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-surface-3">
        <Menu size={20} className="text-text-primary" />
      </button>
      <div className="flex items-center gap-2 ml-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
          <Target size={14} className="text-white" />
        </div>
        <span className="text-sm font-bold">GATE 2028 Tracker</span>
      </div>
    </div>
  );
}
