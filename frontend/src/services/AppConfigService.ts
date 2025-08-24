// services/AppConfigService.ts
import { getColorPaletteByBrand, getBrandImages } from '../api';
import { ColorPaletteData, BrandImagesData } from '../api/types';

export interface ColorPaletteConfig {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  success: string;
}

export interface BrandImagesConfig {
  logo?: {
    id: number;
    url: string;
    name: string;
    contentType: string;
  };
  isotipo?: {
    id: number;
    url: string;
    name: string;
    contentType: string;
  };
  imagotipo?: {
    id: number;
    url: string;
    name: string;
    contentType: string;
  };
}

class AppConfigService {
  private static instance: AppConfigService;
  private colorPalette: ColorPaletteConfig | null = null;
  private brandImages: BrandImagesConfig | null = null;
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
   */
  private async getBrandId(): Promise<number> {
    try {
      const BUILD_BRAND_ID = process.env.EXPO_PUBLIC_BRAND_ID;
      console.log('🏷️ Environment EXPO_PUBLIC_BRAND_ID:', BUILD_BRAND_ID);
      
      if (BUILD_BRAND_ID) {
        const brandId = parseInt(BUILD_BRAND_ID, 10);
        console.log('✅ Brand ID from env:', brandId);
        return brandId;
      }

      // Fallback para desarrollo
      console.warn('⚠️ No brand ID found, using default for development');
      return 1;
    } catch (error) {
      console.error('❌ Error getting brand ID:', error);
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
      
      const colorResponse = await getColorPaletteByBrand(brandId);

      let colorPalette: ColorPaletteData | null = null;

      if (colorResponse.success && colorResponse.data) {
        colorPalette = colorResponse.data;
        console.log('Color palette loaded successfully:', colorPalette);
      } else {
        console.warn('Failed to load color palette from API, using defaults');
      }

      this.colorPalette = this.buildColorConfig(colorPalette);
      console.log('Color palette configured:', this.colorPalette);
      return this.colorPalette;
    } catch (error) {
      console.error('Error loading color palette:', error);
      this.colorPalette = this.getDefaultColors();
      return this.colorPalette;
    }
  }

  /**
   * Carga las imágenes de marca desde el backend
   */
  async loadBrandImages(): Promise<BrandImagesConfig> {
    try {
      const brandId = await this.getBrandId();
      console.log(`🖼️ Loading brand images for brand: ${brandId}`);
      
      const imagesResponse = await getBrandImages(brandId);
      console.log('📡 Full API Response:', JSON.stringify(imagesResponse, null, 2));

      let brandImages: BrandImagesData | null = null;

      if (imagesResponse) {
        brandImages = imagesResponse as BrandImagesData;
        console.log('✅ Brand images loaded successfully:', JSON.stringify(brandImages, null, 2));
      } else {
        console.warn('⚠️ No brand images found in API response');
      }

      this.brandImages = this.buildImagesConfig(brandImages);
      console.log('🎨 Final brand images configured:', JSON.stringify(this.brandImages, null, 2));
      return this.brandImages || this.getDefaultImages();
    } catch (error) {
      console.error('❌ Error loading brand images:', error);
      this.brandImages = this.getDefaultImages();
      return this.brandImages;
    }
  }

  /**
   * Carga toda la configuración (colores e imágenes)
   */
  async loadAppConfig(): Promise<{ colors: ColorPaletteConfig; images: BrandImagesConfig }> {
    const [colors, images] = await Promise.all([
      this.loadColorPalette(),
      this.loadBrandImages()
    ]);

    this.configLoaded = true;
    return { colors, images };
  }

  /**
   * Construye la configuración de imágenes
   */
  private buildImagesConfig(brandImages: BrandImagesData | null): BrandImagesConfig {
    console.log('🏗️ Building images config from:', brandImages);
    
    if (!brandImages) {
      console.log('⚠️ No brand images data provided');
      return this.getDefaultImages();
    }

    const config: BrandImagesConfig = {};

    if (brandImages.logo) {
      console.log('📸 Adding logo to config:', brandImages.logo);
      config.logo = {
        id: brandImages.logo.id,
        url: brandImages.logo.url,
        name: brandImages.logo.name,
        contentType: brandImages.logo.contentType,
      };
    }

    if (brandImages.isotipo) {
      console.log('🎭 Adding isotipo to config:', brandImages.isotipo);
      config.isotipo = {
        id: brandImages.isotipo.id,
        url: brandImages.isotipo.url,
        name: brandImages.isotipo.name,
        contentType: brandImages.isotipo.contentType,
      };
    }

    if (brandImages.imagotipo) {
      console.log('🖼️ Adding imagotipo to config:', brandImages.imagotipo);
      config.imagotipo = {
        id: brandImages.imagotipo.id,
        url: brandImages.imagotipo.url,
        name: brandImages.imagotipo.name,
        contentType: brandImages.imagotipo.contentType,
      };
    }

    console.log('✅ Final images config built:', config);
    return config;
  }

  /**
   * Construye la configuración de colores
   */
  private buildColorConfig(colorPalette: ColorPaletteData | null): ColorPaletteConfig {
    if (!colorPalette) {
      return this.getDefaultColors();
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
   * Configuración por defecto
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

  private getDefaultImages(): BrandImagesConfig {
    return {};
  }

  /**
   * Getters públicos
   */
  getColorPalette(): ColorPaletteConfig | null {
    return this.colorPalette;
  }

  getBrandImages(): BrandImagesConfig | null {
    return this.brandImages;
  }

  getLogoUrl(): string | null {
    return this.brandImages?.logo?.url || null;
  }

  getIsotipoUrl(): string | null {
    return this.brandImages?.isotipo?.url || null;
  }

  getImagotipoUrl(): string | null {
    return this.brandImages?.imagotipo?.url || null;
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
   * Fuerza una recarga de toda la configuración
   */
  async reloadAppConfig(): Promise<{ colors: ColorPaletteConfig; images: BrandImagesConfig }> {
    this.configLoaded = false;
    this.colorPalette = null;
    this.brandImages = null;
    return await this.loadAppConfig();
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