import React, { createContext, useContext, useState } from 'react';

export type ThemeType =
  | 'sky'
  | 'violet'
  | 'mint'
  | 'peach'
  | 'lavender'
  | 'gold'
  | 'teal';

export interface BrandTokens {
  primary: string;
  dark: string;
  accent: string;
  soft: string;
  surface: string;
  white: string;
  // Layout tokens for full-app theming
  sidebarBg: string;
  sidebarText: string;
  sidebarActiveBg: string;
  sidebarActiveText: string;
  headerBg: string;
  mainBg: string;
  cardBg: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  isLight: boolean; // true = light theme, false = dark
}

export const themes: Record<ThemeType, BrandTokens> = {
  // ── LIGHT THEMES ──────────────────────────────────────────────────────────
  sky: {
    primary: '#0EA5E9',
    dark: '#0C4A6E',
    accent: '#F97316',
    soft: '#BAE6FD',
    surface: '#F0F9FF',
    white: '#FFFFFF',
    sidebarBg: '#F0F9FF',
    sidebarText: '#0369A1',
    sidebarActiveBg: '#FFFFFF',
    sidebarActiveText: '#0EA5E9',
    headerBg: '#FFFFFF',
    mainBg: '#E9F1F7', // Slightly deeper for better card contrast
    cardBg: '#FFFFFF',
    border: '#BAE6FD',
    textPrimary: '#0C4A6E',
    textSecondary: '#0369A1',
    isLight: true,
  },
  violet: {
    primary: '#7C3AED',
    dark: '#4C1D95',
    accent: '#F59E0B',
    soft: '#DDD6FE',
    surface: '#F5F3FF',
    white: '#FFFFFF',
    sidebarBg: '#F5F3FF',
    sidebarText: '#5B21B6',
    sidebarActiveBg: '#FFFFFF',
    sidebarActiveText: '#7C3AED',
    headerBg: '#FFFFFF',
    mainBg: '#EFEBFF', // Slightly deeper for better card contrast
    cardBg: '#FFFFFF',
    border: '#DDD6FE',
    textPrimary: '#2E1065',
    textSecondary: '#5B21B6',
    isLight: true,
  },
  mint: {
    primary: '#14B8A6',
    dark: '#134E4A',
    accent: '#F43F5E',
    soft: '#99F6E4',
    surface: '#F0FDFA',
    white: '#FFFFFF',
    sidebarBg: '#F0FDFA',
    sidebarText: '#0F766E',
    sidebarActiveBg: '#FFFFFF',
    sidebarActiveText: '#14B8A6',
    headerBg: '#FFFFFF',
    mainBg: '#E5F3F0', // Slightly deeper for better card contrast
    cardBg: '#FFFFFF',
    border: '#99F6E4',
    textPrimary: '#042F2E',
    textSecondary: '#0F766E',
    isLight: true,
  },
  peach: {
    primary: '#FB7185',
    dark: '#9F1239',
    accent: '#38BDF8',
    soft: '#FECDD3',
    surface: '#FFF5F6',
    white: '#FFFFFF',
    sidebarBg: '#FFF5F6',
    sidebarText: '#BE123C',
    sidebarActiveBg: '#FFFFFF',
    sidebarActiveText: '#FB7185',
    headerBg: '#FFFFFF',
    mainBg: '#FFEAEF', // Slightly deeper for better card contrast
    cardBg: '#FFFFFF',
    border: '#FECDD3',
    textPrimary: '#4C0519',
    textSecondary: '#BE123C',
    isLight: true,
  },
  lavender: {
    primary: '#A855F7',
    dark: '#581C87',
    accent: '#34D399',
    soft: '#E9D5FF',
    surface: '#FAF5FF',
    white: '#FFFFFF',
    sidebarBg: '#FAF5FF',
    sidebarText: '#6B21A8',
    sidebarActiveBg: '#FFFFFF',
    sidebarActiveText: '#A855F7',
    headerBg: '#FFFFFF',
    mainBg: '#F3E8FF', // Slightly deeper for better card contrast
    cardBg: '#FFFFFF',
    border: '#E9D5FF',
    textPrimary: '#3B0764',
    textSecondary: '#6B21A8',
    isLight: true,
  },
  gold: {
    primary: '#D97706',
    dark: '#78350F',
    accent: '#0EA5E9',
    soft: '#FDE68A',
    surface: '#FFFDF0',
    white: '#FFFFFF',
    sidebarBg: '#FFFDF0',
    sidebarText: '#92400E',
    sidebarActiveBg: '#FFFFFF',
    sidebarActiveText: '#D97706',
    headerBg: '#FFFFFF',
    mainBg: '#FAF4D2', // Slightly deeper for better card contrast
    cardBg: '#FFFFFF',
    border: '#FDE68A',
    textPrimary: '#451A03',
    textSecondary: '#92400E',
    isLight: true,
  },
  teal: {
    primary: '#0D9488',
    dark: '#134E4A',
    accent: '#F59E0B',
    soft: '#CCFBF1',
    surface: '#F0FDFA',
    white: '#FFFFFF',
    sidebarBg: '#F0FDFA',
    sidebarText: '#0F766E',
    sidebarActiveBg: '#FFFFFF',
    sidebarActiveText: '#0D9488',
    headerBg: '#FFFFFF',
    mainBg: '#E0EFEB', // Slightly deeper for better card contrast
    cardBg: '#FFFFFF',
    border: '#CCFBF1',
    textPrimary: '#042F2E',
    textSecondary: '#0F766E',
    isLight: true,
  },
};

interface ThemeContextProps {
  theme: ThemeType;
  brand: BrandTokens;
  setTheme: (theme: ThemeType) => void;
  showSalesModule: boolean;
  setShowSalesModule: (show: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const isValidTheme = (value: string | null): value is ThemeType => {
  return value !== null && value in themes;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    try {
      const stored = localStorage.getItem('app_theme');
      return isValidTheme(stored) ? stored : 'sky';
    } catch {
      return 'sky';
    }
  });

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('app_theme', newTheme);
    } catch (e) {
      console.error(e);
    }
  };

  const [showSalesModule, setShowSalesModuleState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('app_show_sales_module');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const setShowSalesModule = (show: boolean) => {
    setShowSalesModuleState(show);
    try {
      localStorage.setItem('app_show_sales_module', show.toString());
    } catch (e) {
      console.error(e);
    }
  };

  const [isDarkMode, setIsDarkModeState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('app_dark_mode');
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const setIsDarkMode = (val: boolean) => {
    setIsDarkModeState(val);
    try {
      localStorage.setItem('app_dark_mode', val.toString());
    } catch (e) {
      console.error(e);
    }
  };

  const baseBrand = themes[theme] ?? themes.sky;
  const brand = isDarkMode ? {
    ...baseBrand,
    dark: '#F8FAFC',
    soft: baseBrand.primary + '30',
    surface: '#1E293B',
    white: '#1E293B',
    sidebarBg: '#0F172A',
    sidebarText: '#94A3B8',
    sidebarActiveBg: '#1E293B',
    sidebarActiveText: baseBrand.primary,
    headerBg: '#1E293B',
    mainBg: '#0F172A',
    cardBg: '#1E293B',
    border: '#334155',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    isLight: false,
  } : baseBrand;

  React.useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', brand.primary);
    root.style.setProperty('--brand-dark', brand.dark);
    root.style.setProperty('--brand-accent', brand.accent);
    root.style.setProperty('--brand-soft', brand.soft);
    root.style.setProperty('--brand-surface', brand.surface);
    root.style.setProperty('--brand-border', brand.border);
    root.style.setProperty('--brand-text-primary', brand.textPrimary);
    root.style.setProperty('--brand-text-secondary', brand.textSecondary);

    root.style.setProperty('--sidebar-bg', brand.sidebarBg);
    root.style.setProperty('--sidebar-text', brand.sidebarText);
    root.style.setProperty('--sidebar-active-bg', brand.sidebarActiveBg);
    root.style.setProperty('--sidebar-active-text', brand.sidebarActiveText);

    root.style.setProperty('--brand-main-bg', brand.mainBg);
    root.style.setProperty('--brand-card-bg', brand.cardBg);
    root.style.setProperty('--brand-white', brand.white);

    // Dynamic alpha/transparency variations
    root.style.setProperty('--brand-primary-10', brand.primary + '10');
    root.style.setProperty('--brand-primary-20', brand.primary + '20');
    root.style.setProperty('--brand-primary-30', brand.primary + '30');
    root.style.setProperty('--brand-soft-25', brand.soft + '25');
    root.style.setProperty('--brand-dark-08', brand.dark + '08');
    root.style.setProperty('--brand-dark-10', brand.dark + '10');
    root.style.setProperty('--brand-dark-15', brand.dark + '15');
    root.style.setProperty('--brand-dark-20', brand.dark + '20');
    root.style.setProperty('--brand-dark-70', brand.dark + '70');
  }, [brand]);

  return (
    <ThemeContext.Provider value={{ theme, brand, setTheme, showSalesModule, setShowSalesModule, isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
