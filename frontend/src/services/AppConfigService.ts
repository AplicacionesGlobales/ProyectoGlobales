// services/AppConfigService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColorPaletteByBrand, getBrandById } from '../api';
import { AppConfigData, ColorPaletteData, BrandData } from '../api/types';

class AppConfigService {
  private static instance: AppConfigService;
  private config: AppConfigData | null = null;
  private configLoaded: boolean = false;

  private constructor() {}

  public static getInstance(): AppConfigService {
    if (!AppConfigService.instance) {
      AppConfigService.instance = new AppConfigService();
    }
    return AppConfigService.instance;
  }

  /**
   * Obtiene el brandId desde AsyncStorage o configuración
   * Este será configurado al momento de generar la APK específica para cada cliente
   */
  private async getBrandId(): Promise<number> {
    try {
      // Opción 2: Desde variable de entorno (configurada al compilar)
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
   * Carga la configuración desde el backend
   */
  async loadConfig(): Promise<AppConfigData> {
    try {
      const brandId = await this.getBrandId();
      console.log(`Loading config for brand: ${brandId}`);
      
      // Intentar cargar desde cache primero
      const cachedConfig = await this.getCachedConfig();
      if (cachedConfig && this.isCacheValid(cachedConfig) && cachedConfig.data.brandId === brandId) {
        console.log('Using cached config');
        this.config = cachedConfig.data;
        this.configLoaded = true;
        return this.config!;
      }

      console.log('Loading fresh config from API');
      
      // Cargar desde el backend en paralelo
      const [colorResponse, brandResponse] = await Promise.allSettled([
        getColorPaletteByBrand(brandId),
        getBrandById(brandId)
      ]);

      let colorPalette: ColorPaletteData | null = null;
      let brandData: BrandData | null = null;

      // Procesar respuesta de colores
      if (colorResponse.status === 'fulfilled' && colorResponse.value.success) {
        colorPalette = colorResponse.value.data!;
        console.log('Color palette loaded successfully');
      } else {
        console.warn('Failed to load color palette, using defaults');
      }

      // Procesar respuesta de marca
      if (brandResponse.status === 'fulfilled' && brandResponse.value.success) {
        brandData = brandResponse.value.data!;
        console.log('Brand data loaded successfully');
      } else {
        console.warn('Failed to load brand data, using defaults');
      }

      // Construir la configuración
      this.config = this.buildConfig(brandId, colorPalette, brandData);

      // Guardar en cache
      await this.cacheConfig(this.config);
      this.configLoaded = true;

      console.log('Config loaded successfully:', this.config);
      return this.config;
    } catch (error) {
      console.error('Error loading app config:', error);
      
      // Usar configuración por defecto en caso de error
      this.config = this.getDefaultConfig();
      this.configLoaded = true;
      return this.config;
    }
  }

  /**
   * Construye la configuración final
   */
  private buildConfig(
    brandId: number, 
    colorPalette: ColorPaletteData | null, 
    brandData: BrandData | null
  ): AppConfigData {
    const defaultColors = {
      primary: '#2563EB',
      secondary: '#6B7280',
      accent: '#06B6D4',
      neutral: '#6B7280',
      success: '#059669',
    };

    const colors = colorPalette ? {
      primary: colorPalette.primary,
      secondary: colorPalette.secondary,
      accent: colorPalette.accent,
      neutral: colorPalette.neutral,
      success: colorPalette.success,
    } : defaultColors;

    return {
      brandId,
      colorPalette: colors,
      branding: {
        appName: brandData?.appName || 'Agenda Pro',
        companyName: brandData?.companyName || brandData?.name || 'Mi Empresa',
        primaryColor: colors.primary,
      },
      logo: brandData?.logo ? {
        uri: brandData.logo.url,
        width: brandData.logo.width,
        height: brandData.logo.height,
      } : undefined,
    };
  }

  /**
   * Configuración por defecto si falla la carga
   */
  private getDefaultConfig(): AppConfigData {
    return {
      brandId: 0,
      colorPalette: {
        primary: '#2563EB',
        secondary: '#6B7280',
        accent: '#06B6D4',
        neutral: '#6B7280',
        success: '#059669',
      },
      branding: {
        appName: 'Agenda Pro',
        companyName: 'Mi Empresa',
        primaryColor: '#2563EB',
      },
    };
  }

  /**
   * Cache management
   */
  private async cacheConfig(config: AppConfigData): Promise<void> {
    try {
      const cacheData = {
        data: config,
        timestamp: Date.now(),
        version: '1.0',
      };
      
      await AsyncStorage.setItem('appConfig', JSON.stringify(cacheData));
      console.log('Config cached successfully');
    } catch (error) {
      console.warn('Failed to cache config:', error);
    }
  }

  private async getCachedConfig(): Promise<any> {
    try {
      const cached = await AsyncStorage.getItem('appConfig');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to get cached config:', error);
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
  getConfig(): AppConfigData | null {
    return this.config;
  }

  isConfigLoaded(): boolean {
    return this.configLoaded;
  }

  getColorPalette() {
    return this.config?.colorPalette || this.getDefaultConfig().colorPalette;
  }

  getPrimaryColor(): string {
    return this.config?.colorPalette.primary || '#2563EB';
  }

  getSecondaryColor(): string {
    return this.config?.colorPalette.secondary || '#6B7280';
  }

  getAppName(): string {
    return this.config?.branding.appName || 'Agenda Pro';
  }

  getCompanyName(): string {
    return this.config?.branding.companyName || 'Mi Empresa';
  }

  /**
   * Fuerza una recarga de la configuración
   */
  async reloadConfig(): Promise<AppConfigData> {
    await AsyncStorage.removeItem('appConfig');
    this.configLoaded = false;
    this.config = null;
    return await this.loadConfig();
  }

  /**
   * Convierte los colores al formato de tu ThemeColors existente
   */
  getThemeColors() {
    const palette = this.getColorPalette();
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