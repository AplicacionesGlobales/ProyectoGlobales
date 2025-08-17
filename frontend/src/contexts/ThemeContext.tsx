import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import AppConfigService from '../services/AppConfigService';
import { AppConfigData } from '../api/types';

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
  appConfig: AppConfigData | null;
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
  const [appConfig, setAppConfig] = useState<AppConfigData | null>(null);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  useEffect(() => {
    loadAppConfig();
  }, []);

  const loadAppConfig = async () => {
    try {
      const configService = AppConfigService.getInstance();
      
      // Si la configuración ya está cargada, usarla
      if (configService.isConfigLoaded()) {
        const config = configService.getConfig();
        if (config) {
          updateFromConfig(config);
          return;
        }
      }

      // Cargar configuración fresca
      const config = await configService.loadConfig();
      updateFromConfig(config);
    } catch (error) {
      console.error('Error loading app config in ThemeProvider:', error);
      // Mantener colores por defecto si falla
      setIsConfigLoaded(true);
    }
  };

  const updateFromConfig = (config: AppConfigData) => {
    console.log('Updating theme from config:', config);
    
    const newColors: ThemeColors = {
      primary: config.colorPalette.primary,
      secondary: config.colorPalette.secondary,
      accent: config.colorPalette.accent,
      background: '#FAFAFA',
      surface: '#FFFFFF',
      text: '#111827',
      textSecondary: '#6B7280',
      success: config.colorPalette.success,
      warning: '#D97706',
      error: '#DC2626',
    };

    setColors(newColors);
    setAppConfig(config);
    setIsConfigLoaded(true);
    
    console.log('Theme updated with colors:', newColors);
  };

  const updateColors = (newColors: Partial<ThemeColors>) => {
    setColors(prev => ({ ...prev, ...newColors }));
  };

  const resetToDefault = () => {
    setColors(defaultColors);
  };

  const reloadConfig = async () => {
    setIsConfigLoaded(false);
    await loadAppConfig();
  };

  return (
    <ThemeContext.Provider value={{ 
      colors, 
      appConfig, 
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

// Hook adicional para acceso rápido a la configuración de la app
export const useAppConfig = () => {
  const { appConfig, isConfigLoaded, reloadConfig } = useTheme();
  return { appConfig, isConfigLoaded, reloadConfig };
};