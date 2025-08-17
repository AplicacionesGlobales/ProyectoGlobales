// contexts/ThemeContext.tsx
import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import AppConfigService, { ColorPaletteConfig } from '../services/AppConfigService';

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
  colorPalette: ColorPaletteConfig | null;
  isConfigLoaded: boolean;
  updateColors: (newColors: Partial<ThemeColors>) => void;
  resetToDefault: () => void;
  reloadConfig: () => Promise<void>;
}

const defaultColors: ThemeColors = {
  primary: '#2563EB',
  secondary: '#6B7280',
  accent: '#06B6D4',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [colorPalette, setColorPalette] = useState<ColorPaletteConfig | null>(null);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  useEffect(() => {
    loadColorPalette();
  }, []);

  const loadColorPalette = async () => {
    try {
      const configService = AppConfigService.getInstance();
      
      // Si la configuración ya está cargada, usarla
      if (configService.isConfigLoaded()) {
        const palette = configService.getColorPalette();
        if (palette) {
          updateFromPalette(palette);
          return;
        }
      }

      // Cargar paleta de colores fresca
      const palette = await configService.loadColorPalette();
      updateFromPalette(palette);
    } catch (error) {
      console.error('Error loading color palette in ThemeProvider:', error);
      // Mantener colores por defecto si falla
      setIsConfigLoaded(true);
    }
  };

  const updateFromPalette = (palette: ColorPaletteConfig) => {
    console.log('Updating theme from color palette:', palette);
    
    const newColors: ThemeColors = {
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
      background: '#FAFAFA',
      surface: '#FFFFFF',
      text: '#111827',
      textSecondary: '#6B7280',
      success: palette.success,
      warning: '#D97706',
      error: '#DC2626',
    };

    setColors(newColors);
    setColorPalette(palette);
    setIsConfigLoaded(true);
    
    console.log('Theme updated with colors:', newColors);
  };

  const updateColors = (newColors: Partial<ThemeColors>) => {
    setColors(prev => ({ ...prev, ...newColors }));
  };

  const resetToDefault = () => {
    setColors(defaultColors);
    setColorPalette(null);
  };

  const reloadConfig = async () => {
    setIsConfigLoaded(false);
    await loadColorPalette();
  };

  return (
    <ThemeContext.Provider value={{ 
      colors, 
      colorPalette, 
      isConfigLoaded, 
      updateColors, 
      resetToDefault,
      reloadConfig 
    }}>
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

// Hook adicional para acceso rápido a la paleta de colores
export const useColorPalette = () => {
  const { colorPalette, isConfigLoaded, reloadConfig } = useTheme();
  return { colorPalette, isConfigLoaded, reloadConfig };
};