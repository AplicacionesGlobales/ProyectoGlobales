// landing\hooks\use-brand-files.ts
import { useState, useCallback } from 'react';
import { filesService, BrandImagesResponseDto, UploadResultDto } from '@/services/files.service';

export function useBrandFiles() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadBrandImage = useCallback(async (
    file: File,
    brandId: number,
    imageType: 'LOGO' | 'ISOTIPO' | 'IMAGOTIPO',
    userId: number
  ): Promise<UploadResultDto> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await filesService.uploadBrandImage(file, brandId, imageType, userId);
      
      if (!result.success) {
        setError(result.error || 'Error uploading image');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadMultipleBrandImages = useCallback(async (
    images: {
      logo?: File;
      isotipo?: File;
      imagotipo?: File;
    },
    brandId: number,
    userId: number
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await filesService.uploadMultipleBrandImages(images, brandId, userId);
      
      if (!result.success) {
        setError(result.errors.join(', '));
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return {
        success: false,
        results: {},
        errors: [errorMessage]
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBrandImages = useCallback(async (brandId: number): Promise<BrandImagesResponseDto | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await filesService.getBrandImages(brandId);
      
      if (!result.success) {
        setError(result.error || 'Error getting brand images');
        return null;
      }
      
      return result.data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    uploadBrandImage,
    uploadMultipleBrandImages,
    getBrandImages,
    clearError
  };
}
