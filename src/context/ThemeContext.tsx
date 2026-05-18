import React, { createContext, useContext, useState } from 'react';

export type ThemeType = 'indigo' | 'emerald' | 'sunset' | 'midnight' | 'rose';

export interface BrandTokens {
  primary: string;
  dark: string;
  accent: string;
  soft: string;
  surface: string;
  white: string;
}

export const themes: Record<ThemeType, BrandTokens> = {
  indigo: {
    primary: '#2759CD',
    dark: '#304166',
    accent: '#EE4932',
    soft: '#BDD1FF',
    surface: '#EFF5FC',
    white: '#FFFFFF',
  },
  emerald: {
    primary: '#10B981',
    dark: '#065F46',
    accent: '#F59E0B',
    soft: '#A7F3D0',
    surface: '#ECFDF5',
    white: '#FFFFFF',
  },
  sunset: {
    primary: '#F59E0B',
    dark: '#78350F',
    accent: '#EF4444',
    soft: '#FDE68A',
    surface: '#FFFBEB',
    white: '#FFFFFF',
  },
  midnight: {
    primary: '#6366F1',
    dark: '#0F172A',
    accent: '#EC4899',
    soft: '#C7D2FE',
    surface: '#EFF1F5', // Keep a light surface for readable tables but slate-ish
    white: '#FFFFFF',
  },
  rose: {
    primary: '#F43F5E',
    dark: '#881337',
    accent: '#10B981',
    soft: '#FECDD3',
    surface: '#FFF1F2',
    white: '#FFFFFF',
  },
};

interface ThemeContextProps {
  theme: ThemeType;
  brand: BrandTokens;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    try {
      const stored = localStorage.getItem('app_theme');
      return (stored as ThemeType) || 'indigo';
    } catch {
      return 'indigo';
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

  const brand = themes[theme];

  return (
    <ThemeContext.Provider value={{ theme, brand, setTheme }}>
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
