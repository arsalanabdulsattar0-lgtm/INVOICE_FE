import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Shield, CreditCard, Palette, Globe, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeType } from '../../context/ThemeContext';

const Settings: React.FC = () => {
  const { theme: activeTheme, setTheme, brand } = useTheme();
  const [showAppearance, setShowAppearance] = useState(true);

  const sections = [
    { id: 'profile', title: 'Profile Settings', desc: 'Manage your public profile and avatar.', icon: User },
    { id: 'notifications', title: 'Notifications', desc: 'Configure how you receive alerts.', icon: Bell },
    { id: 'security', title: 'Security', desc: 'Update password and 2FA settings.', icon: Shield },
    { id: 'billing', title: 'Billing & Plans', desc: 'Manage your subscription and payment methods.', icon: CreditCard },
    { id: 'appearance', title: 'Appearance', desc: 'Customize the look and feel of the app.', icon: Palette },
    { id: 'regional', title: 'Regional & Language', desc: 'Set your preferred currency and time zone.', icon: Globe },
  ];

  const themeOptions: { id: ThemeType; name: string; desc: string; colors: string[] }[] = [
    { id: 'indigo', name: 'Indigo Flow', desc: 'Classic corporate blue & deep navy', colors: ['#2759CD', '#304166', '#EE4932'] },
    { id: 'emerald', name: 'Emerald Growth', desc: 'Vibrant green & fresh teal', colors: ['#10B981', '#065F46', '#F59E0B'] },
    { id: 'sunset', name: 'Sunset Amber', desc: 'Warm glowing amber & soft gold', colors: ['#F59E0B', '#78350F', '#EF4444'] },
    { id: 'midnight', name: 'Midnight Neon', desc: 'High-contrast modern violet & dark slate', colors: ['#6366F1', '#0F172A', '#EC4899'] },
    { id: 'rose', name: 'Rose Premium', desc: 'Luxe rose & sophisticated burgundy', colors: ['#F43F5E', '#881337', '#10B981'] },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Settings Title */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm" style={{ borderColor: brand.dark + '10' }}>
        <h2 className="text-xl font-bold text-slate-900" style={{ color: brand.dark }}>Settings</h2>
        <p className="text-slate-400 text-xs mt-1">Configure your account preferences and application settings.</p>
      </div>

      {/* Original Grid of 6 Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, i) => {
          const isAppearance = section.id === 'appearance';
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                if (isAppearance) {
                  setShowAppearance(!showAppearance);
                }
              }}
              className="flex items-center gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer group"
              style={
                isAppearance && showAppearance
                  ? { borderColor: brand.primary, boxShadow: `${brand.primary}12 0px 8px 24px` }
                  : { borderColor: brand.dark + '08' }
              }
            >
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                style={{
                  backgroundColor: isAppearance && showAppearance ? brand.primary : '#F8FAFC',
                  color: isAppearance && showAppearance ? '#FFFFFF' : '#94A3B8'
                }}
              >
                <section.icon className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors" style={isAppearance && showAppearance ? { color: brand.primary } : {}}>{section.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{section.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Theme Picker Panel - Dynamic Appearance settings */}
      <AnimatePresence>
        {showAppearance && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4"
            style={{ borderColor: brand.dark + '10' }}
          >
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: brand.dark }}>Theme & Branding Selector</h3>
              <p className="text-xs text-slate-400 mt-1">Select an active color palette to instantly style the entire application layout, buttons, inputs, and indicators.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {themeOptions.map((opt) => {
                const isSelected = activeTheme === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between h-[115px] relative ${
                      isSelected ? 'shadow-md border-2' : 'hover:bg-slate-50 border-slate-100 shadow-sm'
                    }`}
                    style={isSelected ? { borderColor: brand.primary } : {}}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-slate-900">{opt.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 pr-6 leading-relaxed line-clamp-2">{opt.desc}</p>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: brand.primary }}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1.5 items-center mt-3">
                      {opt.colors.map((c, idx) => (
                        <div key={idx} className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
