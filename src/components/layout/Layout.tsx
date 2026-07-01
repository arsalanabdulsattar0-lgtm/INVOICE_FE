import React, { useState } from 'react';
import Sidebar from '../common/sidebar/Sidebar';
import Header from './Header';

import AIInlinePanel from '../ui/AIInlinePanel';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  children: React.ReactNode;
  activeView: string;
  invoiceType?: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  userName?: string;
  userRole?: string;
  currentCompany?: { id: string; name: string; logo?: string } | null;
  currentBranch?: { id: string; name: string } | null;
  companies?: { id: string; name: string; is_active: boolean; logo?: string }[];
  branches?: { id: string; companyId: string; name: string }[];
  onContextChange?: (companyId: string, branchId: string, setAsDefault: boolean) => void;
}

const Layout: React.FC<Props> = ({
  children,
  activeView,
  invoiceType,
  onViewChange,
  onLogout,
  userName,
  userRole,
  currentCompany,
  currentBranch,
  companies,
  branches,
  onContextChange
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { brand } = useTheme();

  React.useEffect(() => {
    const reportedCollapsed = isCollapsed;
    (window as any).isSidebarCollapsed = reportedCollapsed;
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { isCollapsed: reportedCollapsed } }));
  }, [isCollapsed]);

  return (
    <div
      className="flex h-screen overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: brand.mainBg }}
    >
      <Sidebar
        activeView={activeView}
        invoiceType={invoiceType}
        onViewChange={onViewChange}
        isCollapsed={isCollapsed}
        onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        onLogout={onLogout}
        userName={userName}
        userRole={userRole}
        currentCompany={currentCompany}
        currentBranch={currentBranch}
        companies={companies}
        branches={branches}
        onContextChange={onContextChange}
      />
      <div className="flex-grow flex flex-col min-w-0">
        <Header
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
          isSidebarOpen={!isCollapsed}
          activeView={activeView}
          onViewChange={onViewChange}
        />
        <main
          className="flex-grow relative overflow-y-auto transition-colors duration-300"
          style={{ backgroundColor: brand.mainBg }}
        >
          <div className="absolute inset-0">
            {children}
          </div>
        </main>
        <AIInlinePanel />
      </div>
    </div>
  );
};

export default Layout;
