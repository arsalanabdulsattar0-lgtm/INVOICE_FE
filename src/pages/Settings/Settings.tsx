import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Shield, CreditCard, Palette, Globe, Check, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeType } from '../../context/ThemeContext';

const Settings: React.FC = () => {
  const { theme: activeTheme, setTheme, brand } = useTheme();
  const [showAppearance, setShowAppearance] = useState(true);

  const sections = [
    { id: 'profile',       title: 'Profile Settings',     desc: 'Manage your public profile and avatar.',              icon: User },
    { id: 'notifications', title: 'Notifications',        desc: 'Configure how you receive alerts.',                   icon: Bell },
    { id: 'security',      title: 'Security',             desc: 'Update password and 2FA settings.',                   icon: Shield },
    { id: 'billing',       title: 'Billing & Plans',      desc: 'Manage your subscription and payment methods.',       icon: CreditCard },
    { id: 'appearance',    title: 'Appearance',           desc: 'Customize the look and feel of the app.',             icon: Palette },
    { id: 'regional',      title: 'Regional & Language',  desc: 'Set your preferred currency and time zone.',          icon: Globe },
  ];

  const lightThemes: { id: ThemeType; name: string; desc: string; colors: string[] }[] = [
    { id: 'sky',      name: 'Sky Blue',        desc: 'Crisp sky blue & refreshing aqua tones',       colors: ['#0EA5E9', '#BAE6FD', '#F97316'] },
    { id: 'violet',   name: 'Soft Violet',     desc: 'Elegant violet & dreamy soft purple',          colors: ['#7C3AED', '#DDD6FE', '#F59E0B'] },
    { id: 'mint',     name: 'Mint Fresh',      desc: 'Cool mint & soothing seafoam green',           colors: ['#14B8A6', '#99F6E4', '#F43F5E'] },
    { id: 'peach',    name: 'Peach Blossom',   desc: 'Warm peach & soft blush tones',               colors: ['#FB7185', '#FECDD3', '#38BDF8'] },
    { id: 'lavender', name: 'Lavender Dream',  desc: 'Soft lavender & delicate lilac hues',         colors: ['#A855F7', '#E9D5FF', '#34D399'] },
    { id: 'gold',     name: 'Golden Hour',     desc: 'Warm gold & rich amber warmth',               colors: ['#D97706', '#FDE68A', '#0EA5E9'] },
    { id: 'teal',     name: 'Teal Serenity',   desc: 'Deep teal & calm ocean-inspired palette',     colors: ['#0D9488', '#CCFBF1', '#F59E0B'] },
  ];

  const ThemeCard = ({ opt, isSelected }: { opt: { id: ThemeType; name: string; desc: string; colors: string[] }; isSelected: boolean }) => (
    <motion.button
      key={opt.id}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setTheme(opt.id)}
      className="text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
      style={{
        height: 120,
        backgroundColor: isSelected ? brand.surface : '#FAFAFA',
        borderColor: isSelected ? brand.primary : '#E2E8F0',
        borderWidth: isSelected ? 2 : 1,
        boxShadow: isSelected ? `0 0 0 3px ${brand.primary}20, 0 4px 16px ${brand.primary}15` : '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: brand.primary }}
        >
          <Check className="w-3 h-3 stroke-[3]" />
        </motion.div>
      )}

      {/* Decorative color blob */}
      <div
        className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20"
        style={{ backgroundColor: opt.colors[0] }}
      />

      <div className="relative z-10">
        <h4 className="text-xs font-bold text-slate-800">{opt.name}</h4>
        <p className="text-[10px] text-slate-400 mt-0.5 pr-5 leading-relaxed line-clamp-2">{opt.desc}</p>
      </div>

      <div className="flex gap-1.5 items-center mt-2 relative z-10">
        {opt.colors.map((c, idx) => (
          <div
            key={idx}
            className="rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: c, width: idx === 0 ? 18 : 12, height: idx === 0 ? 18 : 12 }}
          />
        ))}
        <span className="text-[9px] font-semibold ml-1" style={{ color: opt.colors[0] }}>
          {isSelected ? '● Active' : ''}
        </span>
      </div>
    </motion.button>
  );

  return (
    <div className="p-4 space-y-6" style={{ backgroundColor: brand.mainBg, minHeight: '100%' }}>

      {/* Settings Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl border shadow-sm transition-colors duration-300"
        style={{ backgroundColor: brand.cardBg, borderColor: brand.border }}
      >
        <h2 className="text-xl font-bold transition-colors duration-300" style={{ color: brand.textPrimary }}>Settings</h2>
        <p className="text-xs mt-1 transition-colors duration-300" style={{ color: brand.textSecondary }}>
          Configure your account preferences and application settings.
        </p>
      </motion.div>

      {/* Grid of 6 Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, i) => {
          const isAppearance = section.id === 'appearance';
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => { if (isAppearance) setShowAppearance(!showAppearance); }}
              className="flex items-center gap-6 p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all cursor-pointer group"
              style={{
                backgroundColor: brand.cardBg,
                borderColor: isAppearance && showAppearance ? brand.primary : brand.border,
                boxShadow: isAppearance && showAppearance ? `0 0 0 2px ${brand.primary}20` : undefined,
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  backgroundColor: isAppearance && showAppearance ? brand.primary : brand.surface,
                  color: isAppearance && showAppearance ? '#FFFFFF' : brand.textSecondary,
                }}
              >
                <section.icon className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                <h3
                  className="text-sm font-bold transition-colors"
                  style={{ color: isAppearance && showAppearance ? brand.primary : brand.textPrimary }}
                >
                  {section.title}
                </h3>
                <p className="text-xs mt-1" style={{ color: brand.textSecondary }}>{section.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Theme Picker Panel */}
      <AnimatePresence>
        {showAppearance && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="rounded-3xl border shadow-sm overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: brand.cardBg, borderColor: brand.border }}
          >
            {/* Panel Header */}
            <div
              className="px-6 py-5 border-b"
              style={{ borderColor: brand.border, background: `linear-gradient(135deg, ${brand.surface}, ${brand.cardBg})` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: brand.primary }}
                >
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: brand.textPrimary }}>
                    Theme & Branding Selector
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: brand.textSecondary }}>
                    Select a palette to instantly style the entire application.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">

              {/* Light Themes Grid */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sun className="w-3.5 h-3.5" style={{ color: brand.primary }} />
                  <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: brand.textSecondary }}>
                    Color Themes
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {lightThemes.map(opt => (
                    <ThemeCard key={opt.id} opt={opt} isSelected={activeTheme === opt.id} />
                  ))}
                </div>
              </div>

              {/* Active Theme Preview Banner */}
              <motion.div
                key={activeTheme}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl p-4 flex items-center gap-4"
                style={{
                  background: `linear-gradient(135deg, ${brand.primary}18, ${brand.soft}40)`,
                  border: `1px solid ${brand.primary}30`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 shadow-md"
                  style={{ backgroundColor: brand.primary }}
                />
                <div>
                  <p className="text-xs font-bold" style={{ color: brand.textPrimary }}>
                    Active Theme Applied ✓
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: brand.textSecondary }}>
                    Primary: <strong>{brand.primary}</strong> &nbsp;·&nbsp; Surface: <strong>{brand.surface}</strong>
                  </p>
                </div>
                <div className="flex gap-1.5 ml-auto">
                  {[brand.primary, brand.accent, brand.soft].map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white shadow" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
