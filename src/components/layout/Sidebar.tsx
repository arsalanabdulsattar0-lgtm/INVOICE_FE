import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  HelpCircle, 
  LogOut,
  PlusCircle,
  Zap
} from 'lucide-react';

interface Props {
  activeView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
}

const Sidebar: React.FC<Props> = ({ activeView, onViewChange, isCollapsed }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'add-invoice', label: 'Create New', icon: PlusCircle },
    { id: 'add-invoice-v2', label: 'Create V2', icon: Zap },
    { id: 'add-invoice-v3', label: 'Create V3', icon: Zap },
    { id: 'add-invoice-v4', label: 'Create V4', icon: Zap },
    { id: 'clients', label: 'Clients', icon: Users },
  ];

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 60 : 224 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-white border-r border-slate-200 h-screen flex flex-col sticky top-0 flex-shrink-0 overflow-hidden z-50"
    >
      <div className={`py-6 flex items-center ${isCollapsed ? 'justify-center' : 'px-6 gap-2.5'}`}>
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
          <span className="text-white font-bold text-lg">I</span>
        </div>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold tracking-tight text-slate-900 truncate"
          >
            InvoiceFlow
          </motion.span>
        )}
      </div>

      <nav className={`flex-grow ${isCollapsed ? 'px-0' : 'px-3'} space-y-4 py-4`}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-4'} py-2.5 rounded-full text-[13px] font-medium transition-all relative ${
              activeView === item.id 
                ? 'text-indigo-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title={isCollapsed ? item.label : ''}
          >
            {activeView === item.id && !isCollapsed && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-full z-0"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon className={`w-4 h-4 relative z-10 ${activeView === item.id ? 'text-indigo-600' : 'text-slate-400'}`} />
            {!isCollapsed && <span className="relative z-10 truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className={`py-4 border-t border-slate-100 space-y-4 ${isCollapsed ? 'px-0' : 'px-3'}`}>
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-4'} py-2.5 rounded-full text-[13px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all`}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon className="w-4 h-4 text-slate-400" />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}
        
        <button className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-4'} py-2.5 rounded-full text-[13px] font-medium text-red-500 hover:bg-red-50 transition-all`}>
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
