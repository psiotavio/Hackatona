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
    primary: '#007AFF',
    primary50: '#4DA3FF',
    primary20: '#99CCFF',
    secondary: '#5856D6',
    secondary50: '#8A89E3',
    secondary20: '#BCBCF0',
    tertiary: '#FF2D55',
    tertiary50: '#FF7A9A',
    tertiary20: '#FFB8C9',
    highlight: '#FF9500',
    textPrimary: '#FFFFFF',
    textSecondary: '#B3B3B3',
    titlePrimary: '#FFFFFF',
    titleSecondary: '#CCCCCC',
    placeholder: '#666666',
    labels: '#999999',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FFCC00',
    background: '#000000',
    background50: '#1C1C1E',
    background20: '#2C2C2E',
    border: '#38383A',
  },
  light: {
    primary: '#007AFF',
    primary50: '#4DA3FF',
    primary20: '#99CCFF',
    secondary: '#5856D6',
    secondary50: '#8A89E3',
    secondary20: '#BCBCF0',
    tertiary: '#FF2D55',
    tertiary50: '#FF7A9A',
    tertiary20: '#FFB8C9',
    highlight: '#FF9500',
    textPrimary: '#000000',
    textSecondary: '#666666',
    titlePrimary: '#000000',
    titleSecondary: '#333333',
    placeholder: '#999999',
    labels: '#666666',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FFCC00',
    background: '#FFFFFF',
    background50: '#F2F2F7',
    background20: '#E5E5EA',
    border: '#C7C7CC',
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