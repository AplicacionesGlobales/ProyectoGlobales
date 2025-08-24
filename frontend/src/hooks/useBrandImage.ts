// hooks/useBrandImage.ts
import { useBrandImages } from '../contexts/ThemeContext';

export type BrandImageType = 'logo' | 'isotipo' | 'imagotipo';

interface BrandImageHookResult {
  imageUrl: string | null;
  isLoading: boolean;
  isAvailable: boolean;
  imageData: {
    id?: number;
    name?: string;
    contentType?: string;
  } | null;
}

/**
 * Hook personalizado para obtener una imagen específica de marca
 * @param imageType - Tipo de imagen a obtener ('logo', 'isotipo', 'imagotipo')
 * @returns Datos de la imagen solicitada
 */
export const useBrandImage = (imageType: BrandImageType): BrandImageHookResult => {
  const { brandImages, isConfigLoaded } = useBrandImages();

  const imageData = brandImages?.[imageType] || null;
  
  // Debug logs
  console.log(`🔍 useBrandImage(${imageType}) Debug:`, {
    isConfigLoaded,
    brandImages,
    imageData,
    hasImageUrl: !!imageData?.url
  });
  
  return {
    imageUrl: imageData?.url || null,
    isLoading: !isConfigLoaded,
    isAvailable: !!imageData?.url,
    imageData: imageData ? {
      id: imageData.id,
      name: imageData.name,
      contentType: imageData.contentType,
    } : null,
  };
};

/**
 * Hook específico para el logo principal
 */
export const useLogo = () => useBrandImage('logo');

/**
 * Hook específico para el isotipo (símbolo/ícono)
 */
export const useIsotipo = () => useBrandImage('isotipo');

/**
 * Hook específico para el imagotipo (logo + símbolo combinado)
 */
export const useImagotipo = () => useBrandImage('imagotipo');

/**
 * Hook que devuelve la mejor imagen disponible según prioridad
 * Prioridad: logo > imagotipo > isotipo
 */
export const useBestAvailableImage = (): BrandImageHookResult => {
  const { brandImages, isConfigLoaded } = useBrandImages();

  if (!isConfigLoaded) {
    return {
      imageUrl: null,
      isLoading: true,
      isAvailable: false,
      imageData: null,
    };
  }

  // Prioridad: logo > imagotipo > isotipo
  const bestImage = brandImages?.logo || brandImages?.imagotipo || brandImages?.isotipo;

  return {
    imageUrl: bestImage?.url || null,
    isLoading: false,
    isAvailable: !!bestImage?.url,
    imageData: bestImage ? {
      id: bestImage.id,
      name: bestImage.name,
      contentType: bestImage.contentType,
    } : null,
  };
};

export default useBrandImage;
