import React from 'react';
import AICommandBar from '../ui/AICommandBar';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  activeView: string;
  onViewChange: (view: string) => void;
}

const Header: React.FC<Props> = ({ activeView, onViewChange }) => {
  const { brand } = useTheme();

  return (
    <header
      className="relative z-[100] min-h-[110px] px-8 pt-6 pb-4 flex items-start sticky top-0 transition-colors duration-300"
      style={{
        backgroundColor: brand.headerBg,
        borderBottom: `1px solid ${brand.border}`,
      }}
    >
      <div className="flex-grow w-full">
        <AICommandBar activeView={activeView} onViewChange={onViewChange} />
      </div>
    </header>
  );
};

export default Header;
