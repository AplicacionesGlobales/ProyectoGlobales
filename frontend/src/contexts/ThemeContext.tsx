import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  updateColors: (newColors: Partial<ThemeColors>) => void;
  resetToDefault: () => void;
}

const defaultColors: ThemeColors = {
  primary: '#2563EB',      // Azul moderno y profesional
  secondary: '#6B7280',    // Gris neutro suave
  accent: '#06B6D4',       // Cian elegante
  background: '#FAFAFA',   // Gris muy claro, menos blanco puro
  surface: '#FFFFFF',      // Blanco puro para tarjetas
  text: '#111827',         // Negro suave, no puro
  textSecondary: '#6B7280', // Gris medio para texto secundario
  success: '#059669',      // Verde esmeralda moderno
  warning: '#D97706',      // Naranja cálido
  error: '#DC2626',        // Rojo moderno
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [colors, setColors] = useState<ThemeColors>(defaultColors);

  const updateColors = (newColors: Partial<ThemeColors>) => {
    setColors(prev => ({ ...prev, ...newColors }));
  };

  const resetToDefault = () => {
    setColors(defaultColors);
  };

  return (
    <ThemeContext.Provider value={{ colors, updateColors, resetToDefault }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
