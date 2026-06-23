import React, { useState } from 'react';
import AICommandBar from '../ui/AICommandBar';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, X } from 'lucide-react';

interface Props {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  activeView: string;
  onViewChange: (view: string) => void;
}

const Header: React.FC<Props> = ({ activeView, onViewChange }) => {
  const { brand } = useTheme();
  const [aiOpen, setAiOpen] = useState(false);

  if (activeView === 'settings') return null;

  return (
    <header
      className="sticky top-0 z-[100] print-hidden transition-all duration-300"
      style={{
        backgroundColor: aiOpen ? brand.headerBg : 'transparent',
        borderBottom: aiOpen ? `1px solid ${brand.border}` : 'none',
      }}
    >
      {/* Slim strip that holds only the icon — always 40px tall */}
      <div className="relative flex items-center justify-end pr-5 py-0.5">
        <button
          onClick={() => setAiOpen(v => !v)}
          title={aiOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
          className="w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer shadow-md"
          style={{
            backgroundColor: aiOpen ? '#fff' : brand.primary,
            color: aiOpen ? brand.primary : '#fff',
            border: aiOpen ? `1.5px solid ${brand.primary}` : 'none',
          }}
        >
          {aiOpen ? <X className="w-4 !h-2" /> : <Sparkles className="w-4 h-4" />}
        </button>
      </div>

      {/* AI command bar — expands below the icon strip, overflow visible for dropdowns */}
      {aiOpen && (
        <div
          className="px-6 pb-4"
          style={{ overflow: 'visible' }}
        >
          <AICommandBar activeView={activeView} onViewChange={onViewChange} />
        </div>
      )}
    </header>
  );
};

export default Header;
