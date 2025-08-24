// contexts/ThemeContext.tsx
import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import AppConfigService, { ColorPaletteConfig, BrandImagesConfig } from '../services/AppConfigService';

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
  brandImages: BrandImagesConfig | null;
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
  const [brandImages, setBrandImages] = useState<BrandImagesConfig | null>(null);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  useEffect(() => {
    loadAppConfig();
  }, []);

  const loadAppConfig = async () => {
    try {
      const configService = AppConfigService.getInstance();
      
      // Si la configuración ya está cargada, usarla
      if (configService.isConfigLoaded()) {
        console.log('📦 Using already loaded config from service');
        const palette = configService.getColorPalette();
        const images = configService.getBrandImages();
        
        if (palette) {
          console.log('🎨 Setting color palette from service:', palette);
          setColorPalette(palette); // ⭐ AQUÍ ESTABA EL PROBLEMA - faltaba esto
          updateFromPalette(palette);
        }
        
        if (images) {
          console.log('🖼️ Setting brand images from service:', images);
          setBrandImages(images);
        }
        
        setIsConfigLoaded(true);
        return;
      }

      console.log('🌐 Loading fresh config from API');
      
      // Cargar configuración completa
      const config = await configService.loadAppConfig();
      
      console.log('✅ Config loaded successfully:', config);
      
      // Actualizar estado con los datos cargados
      setColorPalette(config.colors);
      updateFromPalette(config.colors);
      setBrandImages(config.images);
      setIsConfigLoaded(true);
      
    } catch (error) {
      console.error('❌ Error loading app config in ThemeProvider:', error);
      // Mantener valores por defecto si falla
      setIsConfigLoaded(true);
    }
  };

  const updateFromPalette = (palette: ColorPaletteConfig) => {
    console.log('🔄 Updating theme from color palette:', palette);
    
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
    console.log('✅ Theme updated with colors:', newColors);
  };

  const updateColors = (newColors: Partial<ThemeColors>) => {
    setColors(prev => ({ ...prev, ...newColors }));
  };

  const resetToDefault = () => {
    setColors(defaultColors);
    setColorPalette(null);
    setBrandImages(null);
  };

  const reloadConfig = async () => {
    console.log('🔄 Reloading config...');
    setIsConfigLoaded(false);
    setColorPalette(null);
    setBrandImages(null);
    await loadAppConfig();
  };

  // Debug logs para verificar el estado
  console.log('🔍 ThemeProvider State:', {
    isConfigLoaded,
    hasColorPalette: !!colorPalette,
    hasBrandImages: !!brandImages,
    brandImages,
  });

  return (
    <ThemeContext.Provider value={{ 
      colors, 
      colorPalette, 
      brandImages,
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

// Hook adicional para acceso rápido a las imágenes de marca
export const useBrandImages = () => {
  const { brandImages, isConfigLoaded, reloadConfig } = useTheme();
  
  // Debug log específico para este hook
  console.log('🔍 useBrandImages Hook:', {
    brandImages,
    isConfigLoaded,
    hasLogo: !!brandImages?.logo,
    logoUrl: brandImages?.logo?.url
  });
  
  return { brandImages, isConfigLoaded, reloadConfig };
};