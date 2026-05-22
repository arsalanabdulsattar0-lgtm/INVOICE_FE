import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { motion, AnimatePresence } from 'framer-motion';
import AIInlinePanel from '../ui/AIInlinePanel';

interface Props {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<Props> = ({ children, activeView, onViewChange, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  React.useEffect(() => {
    (window as any).isSidebarCollapsed = isCollapsed;
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { isCollapsed } }));
  }, [isCollapsed]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        activeView={activeView} 
        onViewChange={onViewChange} 
        isCollapsed={isCollapsed}
        onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        onLogout={onLogout}
      />
      <div className="flex-grow flex flex-col min-w-0">
        <Header onToggleSidebar={() => setIsCollapsed(!isCollapsed)} isSidebarOpen={!isCollapsed} activeView={activeView} onViewChange={onViewChange} />
        <main className="flex-grow relative overflow-y-auto bg-slate-50/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <AIInlinePanel />
      </div>
    </div>
  );
};

export default Layout;
