import React from 'react';
import AICommandBar from '../ui/AICommandBar';

interface Props {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  activeView: string;
  onViewChange: (view: string) => void;
}

const Header: React.FC<Props> = ({ activeView, onViewChange }) => {
  return (
    <header className="relative z-[100] min-h-[110px] bg-white border-b border-slate-200 px-8 pt-6 pb-4 flex items-start sticky top-0">

      <div className="flex-grow w-full">
        <AICommandBar activeView={activeView} onViewChange={onViewChange} />
      </div>


    </header>
  );
};

export default Header;
