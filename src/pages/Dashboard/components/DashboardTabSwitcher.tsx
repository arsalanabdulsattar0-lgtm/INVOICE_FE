import type { FC } from 'react';
import { motion } from 'framer-motion';
import { usePermissions } from '../../../context/PermissionContext';
import { useTheme } from '../../../context/ThemeContext';

interface DashboardTabSwitcherProps {
  companyId: string;
  activeTab: 'dashboard' | 'dashboard1' | 'dashboard2';
  onViewChange?: (view: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Default', fnId: 'default_dashboard' },
  { id: 'dashboard1', label: 'Inventory Operations Dashboard', fnId: 'inventory_dashboard' },
  { id: 'dashboard2', label: 'Business overview', fnId: 'business_overview' },
];

export const DashboardTabSwitcher: React.FC<DashboardTabSwitcherProps> = ({ companyId, activeTab, onViewChange }) => {
  const { brand } = useTheme();
  const { isFunctionEnabled } = usePermissions();

  const isSpecificUser = (() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.email === 'arsalanabdulsattar0@gmail.com';
      }
    } catch {}
    return false;
  })();

  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        background: brand.surface,
        padding: '5px',
        borderRadius: 12,
        border: `1px solid ${brand.border}`,
      }}
      className="select-none"
    >
      {tabs
        .filter((item) => {
          if (isSpecificUser && item.id !== 'dashboard1') return false;
          return isFunctionEnabled(companyId, item.fnId as any);
        })
        .map((item) => {
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange?.(item.id)}
              style={{
                position: 'relative',
                padding: '8px 14px',
                borderRadius: 10,
                border: isActive ? `1px solid ${brand.primary}` : '1px solid transparent',
                background: isActive ? `linear-gradient(135deg, ${brand.primary}, ${brand.accent || brand.primary})` : 'transparent',
                color: isActive ? '#ffffff' : brand.textSecondary,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                minWidth: 120,
                transition: 'all 0.2s ease',
                boxShadow: isActive ? `0 6px 16px ${brand.primary}20` : 'none',
              }}
            >
              <span style={{ position: 'relative', zIndex: 1 }}>{item.label}</span>
            </button>
          );
        })}
    </div>
  );
};

export default DashboardTabSwitcher;
