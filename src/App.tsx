import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import { Sidebar, MobileHeader } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { SubjectManagement } from '@/components/SubjectManagement';
import { RevisionTracker } from '@/components/RevisionTracker';
import { RevisionCalendar } from '@/components/RevisionCalendar';
import { StudyAnalytics } from '@/components/StudyAnalytics';
import { MockTestTracker } from '@/components/MockTestTracker';
import { PYQTracker } from '@/components/PYQTracker';
import { DSATracker } from '@/components/DSATracker';
import { Motivation } from '@/components/Motivation';
import { LoginPage } from '@/components/LoginPage';
import type { TabType } from '@/types';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 size={32} className="text-accent animate-spin" />
          <p className="text-sm text-text-muted">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'subjects': return <SubjectManagement />;
      case 'revisions': return <RevisionTracker />;
      case 'calendar': return <RevisionCalendar />;
      case 'analytics': return <StudyAnalytics />;
      case 'mock-tests': return <MockTestTracker />;
      case 'pyq': return <PYQTracker />;
      case 'dsa': return <DSATracker />;
      case 'motivation': return <Motivation />;
      default: return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-surface-0">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
