import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeColors = {
  primary: string;
  primary50: string;
  primary20: string;
  secondary: string;
  secondary50: string;
  secondary20: string;
  tertiary: string;
  tertiary50: string;
  tertiary20: string;
  highlight: string;
  textPrimary: string;
  textSecondary: string;
  titlePrimary: string;
  titleSecondary: string;
  placeholder: string;
  labels: string;
  error: string;
  success: string;
  warning: string;
  background: string;
  background50: string;
  background20: string;
  border: string;
};

type Theme = {
  dark: ThemeColors;
  light: ThemeColors;
};

const theme: Theme = {
  dark: {
    primary: '#DDB892',
    primary50: '#B08968',
    primary20: '#9C6644',
    secondary: '#E6CCB2',
    secondary50: '#DDB892',
    secondary20: '#B08968',
    tertiary: '#7F5539',
    tertiary50: '#9C6644',
    tertiary20: '#583101',
    highlight: '#E6CCB2',
    textPrimary: '#EDE0D4',
    textSecondary: '#DDB892',
    titlePrimary: '#EDE0D4',
    titleSecondary: '#E6CCB2',
    placeholder: '#B08968',
    labels: '#DDB892',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FFCC00',
    background: '#2C1810',
    background50: '#3D2318',
    background20: '#4D2C1F',
    border: '#7F5539',
  },
  light: {
    primary: '#583101',
    primary50: '#9C6644',
    primary20: '#B08968',
    secondary: '#7F5539',
    secondary50: '#B08968',
    secondary20: '#DDB892',
    tertiary: '#E6CCB2',
    tertiary50: '#E6CCB2',
    tertiary20: '#EDE0D4',
    highlight: '#B08968',
    textPrimary: '#583101',
    textSecondary: '#7F5539',
    titlePrimary: '#583101',
    titleSecondary: '#9C6644',
    placeholder: '#B08968',
    labels: '#7F5539',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FFCC00',
    background: '#EDE0D4',
    background50: '#E6CCB2',
    background20: '#DDB892',
    border: '#B08968',
  },
};

type ThemeContextType = {
  themeMode: ThemeMode;
  currentTheme: 'light' | 'dark';
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  // Determina o tema atual baseado no themeMode e no tema do sistema
  const currentTheme = themeMode === 'system' 
    ? systemColorScheme ?? 'light'
    : themeMode;

  // Atualiza o tema quando o tema do sistema muda
  useEffect(() => {
    if (themeMode === 'system') {
      // O tema será atualizado automaticamente através do currentTheme
    }
  }, [systemColorScheme, themeMode]);

  const colors = theme[currentTheme];

  return (
    <ThemeContext.Provider value={{ themeMode, currentTheme, colors, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 