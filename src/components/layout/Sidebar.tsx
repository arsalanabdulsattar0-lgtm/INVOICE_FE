import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  HelpCircle, 
  LogOut,
  Zap,
  Menu,
  Sparkles,
  ChevronDown,
  Box
} from 'lucide-react';
interface Props {
  activeView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<Props> = ({ activeView, onViewChange, isCollapsed, onToggleSidebar, onLogout }) => {
    const handleMenuClick = (id: string) => {
      onViewChange(id);
    };

    const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'dashboard1', label: 'Dashboard 1', icon: Sparkles },
      { id: 'invoices', label: 'Invoices', icon: FileText },
      { id: 'add-invoice-v4', label: 'Create V4', icon: Zap },
      { id: 'clients', label: 'Clients', icon: Users },
      { id: 'products', label: 'Products', icon: Box },
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
        <button 
          onClick={onToggleSidebar}
          className={`group/logo relative ${isCollapsed ? 'w-10 h-10' : 'w-8 h-8'} bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0 overflow-hidden transition-all hover:bg-indigo-700`}
        >
          {/* Logo Letter */}
          <span className={`text-white font-bold ${isCollapsed ? 'text-xl' : 'text-lg'} group-hover/logo:scale-0 transition-all duration-300`}>I</span>
          
          {/* Toggle Icon appearing on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 scale-50 group-hover/logo:scale-100 transition-all duration-300">
             <Menu className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} text-white`} />
          </div>
        </button>
        
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

      <nav className={`flex-grow ${isCollapsed ? 'px-2' : 'px-3'} space-y-1.5 py-4 overflow-y-auto custom-scrollbar`}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0 h-11' : 'gap-2.5 px-4 py-2.5'} rounded-xl text-[13px] font-medium transition-all relative ${
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
            <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'} relative z-10 ${activeView === item.id ? 'text-indigo-600' : 'text-slate-400'}`} />
            {!isCollapsed && <span className="relative z-10 truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className={`py-4 border-t border-slate-100 space-y-1.5 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0 h-11' : 'gap-2.5 px-4 py-2.5'} rounded-xl text-[13px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all`}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'} text-slate-400`} />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}
        
        <button 
          onClick={onLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0 h-11' : 'gap-2.5 px-4 py-2.5'} rounded-xl text-[13px] font-medium text-red-500 hover:bg-red-50 transition-all`}
        >
          <LogOut className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'}`} />
          {!isCollapsed && <span>Logout</span>}
        </button>

        {/* PROFILE CARD */}
        <div className={`mt-4 pt-4 border-t border-slate-100`}>
          <button className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-2'} group cursor-pointer`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-100 shrink-0">
                JD
              </div>
              {!isCollapsed && (
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 leading-tight">John Doe</p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Admin Account</p>
                </div>
              )}
            </div>
            {!isCollapsed && <ChevronDown className="w-4 h-4 text-slate-400 group-hover:translate-y-0.5 transition-transform shrink-0" />}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
