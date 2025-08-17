// services/AppConfigService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColorPaletteByBrand } from '../api';
import { ColorPaletteData } from '../api/types';

export interface ColorPaletteConfig {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  success: string;
}

class AppConfigService {
  private static instance: AppConfigService;
  private colorPalette: ColorPaletteConfig | null = null;
  private configLoaded: boolean = false;

  private constructor() {}

  public static getInstance(): AppConfigService {
    if (!AppConfigService.instance) {
      AppConfigService.instance = new AppConfigService();
    }
    return AppConfigService.instance;
  }

  /**
   * Obtiene el brandId desde variable de entorno
   * Este será configurado al momento de generar la APK específica para cada cliente
   */
  private async getBrandId(): Promise<number> {
    try {
      // Desde variable de entorno (configurada al compilar)
      const BUILD_BRAND_ID = process.env.EXPO_PUBLIC_BRAND_ID;
      if (BUILD_BRAND_ID) {
        console.log('Brand ID from env:', BUILD_BRAND_ID);
        return parseInt(BUILD_BRAND_ID, 10);
      }

      // Fallback para desarrollo
      console.warn('No brand ID found, using default for development');
      return 1; // ID por defecto para desarrollo
    } catch (error) {
      console.error('Error getting brand ID:', error);
      return 1;
    }
  }

  /**
   * Carga la paleta de colores desde el backend
   */
  async loadColorPalette(): Promise<ColorPaletteConfig> {
    try {
      const brandId = await this.getBrandId();
      console.log(`Loading color palette for brand: ${brandId}`);
      
      // Intentar cargar desde cache primero
      const cachedPalette = await this.getCachedPalette();
      if (cachedPalette && this.isCacheValid(cachedPalette) && cachedPalette.brandId === brandId) {
        console.log('Using cached color palette');
        this.colorPalette = cachedPalette.data;
        this.configLoaded = true;
        return this.colorPalette || this.getDefaultColors();
      }

      console.log('Loading fresh color palette from API');
      
      // Cargar desde el backend
      const colorResponse = await getColorPaletteByBrand(brandId);

      let colorPalette: ColorPaletteData | null = null;

      // Procesar respuesta de colores
      if (colorResponse.success && colorResponse.data) {
        colorPalette = colorResponse.data;
        console.log('Color palette loaded successfully:', colorPalette);
      } else {
        console.warn('Failed to load color palette from API, using defaults');
      }

      // Construir la configuración de colores
      this.colorPalette = this.buildColorConfig(colorPalette);

      // Guardar en cache
      await this.cachePalette(this.colorPalette, brandId);
      this.configLoaded = true;

      console.log('Color palette configured:', this.colorPalette);
      return this.colorPalette;
    } catch (error) {
      console.error('Error loading color palette:', error);
      
      // Usar configuración por defecto en caso de error
      this.colorPalette = this.getDefaultColors();
      this.configLoaded = true;
      return this.colorPalette;
    }
  }

  /**
   * Construye la configuración de colores
   */
  private buildColorConfig(colorPalette: ColorPaletteData | null): ColorPaletteConfig {
    const defaultColors = this.getDefaultColors();

    if (!colorPalette) {
      return defaultColors;
    }

    return {
      primary: colorPalette.primary,
      secondary: colorPalette.secondary,
      accent: colorPalette.accent,
      neutral: colorPalette.neutral,
      success: colorPalette.success,
    };
  }

  /**
   * Configuración de colores por defecto
   */
  private getDefaultColors(): ColorPaletteConfig {
    return {
      primary: '#2563EB',
      secondary: '#6B7280',
      accent: '#06B6D4',
      neutral: '#6B7280',
      success: '#059669',
    };
  }

  /**
   * Cache management
   */
  private async cachePalette(palette: ColorPaletteConfig, brandId: number): Promise<void> {
    try {
      const cacheData = {
        data: palette,
        brandId,
        timestamp: Date.now(),
        version: '1.0',
      };
      
      await AsyncStorage.setItem('colorPalette', JSON.stringify(cacheData));
      console.log('Color palette cached successfully');
    } catch (error) {
      console.warn('Failed to cache color palette:', error);
    }
  }

  private async getCachedPalette(): Promise<any> {
    try {
      const cached = await AsyncStorage.getItem('colorPalette');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to get cached color palette:', error);
      return null;
    }
  }

  private isCacheValid(cachedData: any): boolean {
    if (!cachedData || !cachedData.timestamp) return false;
    
    // Cache válido por 24 horas
    const cacheAge = Date.now() - cachedData.timestamp;
    const maxAge = 24 * 60 * 60 * 1000;
    
    return cacheAge < maxAge;
  }

  /**
   * Getters públicos
   */
  getColorPalette(): ColorPaletteConfig | null {
    return this.colorPalette;
  }

  isConfigLoaded(): boolean {
    return this.configLoaded;
  }

  getPrimaryColor(): string {
    return this.colorPalette?.primary || '#2563EB';
  }

  getSecondaryColor(): string {
    return this.colorPalette?.secondary || '#6B7280';
  }

  getAccentColor(): string {
    return this.colorPalette?.accent || '#06B6D4';
  }

  getSuccessColor(): string {
    return this.colorPalette?.success || '#059669';
  }

  /**
   * Fuerza una recarga de la paleta de colores
   */
  async reloadColorPalette(): Promise<ColorPaletteConfig> {
    await AsyncStorage.removeItem('colorPalette');
    this.configLoaded = false;
    this.colorPalette = null;
    return await this.loadColorPalette();
  }

  /**
   * Convierte los colores al formato ThemeColors
   */
  getThemeColors() {
    const palette = this.colorPalette || this.getDefaultColors();
    return {
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
  }
}

export default AppConfigService;