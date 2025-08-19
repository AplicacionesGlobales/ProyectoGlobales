// landing\services\files.service.ts
import { apiClient } from '../api';

export interface UploadBrandImageData {
  brandId: number;
  imageType: 'LOGO' | 'ISOTOPO' | 'IMAGOTIPO';
  userId: number;
}

export interface FileResponseDto {
  id: number;
  name: string;
  url: string;
  key: string;
  contentType: string;
  fileType: string;
  size?: number;
  entityId: number;
  entityType: string;
  uploadedBy?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResultDto {
  success: boolean;
  file?: FileResponseDto;
  error?: string;
}

export interface BrandImagesResponseDto {
  logo: FileResponseDto | null;
  isotipo: FileResponseDto | null;
  imagotipo: FileResponseDto | null;
}

class FilesService {
  /**
   * Sube una imagen de marca específica (logo, isotipo o imagotipo)
   */
  async uploadBrandImage(
    file: File,
    brandId: number,
    imageType: 'LOGO' | 'ISOTIPO' | 'IMAGOTIPO',
    userId: number
  ): Promise<UploadResultDto> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('brandId', brandId.toString());
      formData.append('imageType', imageType);
      formData.append('userId', userId.toString());

      console.log('📤 Uploading brand image:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        brandId,
        imageType,
        userId
      });

      const response = await apiClient.postFormData<UploadResultDto>(
        '/files/brand-images',
        formData
      );

      console.log('📤 Upload response:', response);

      if (response.success && response.data) {
        console.log('✅ Upload successful:', response.data);
        return response.data;
      } else {
        console.error('❌ Upload failed with response:', response);
        return {
          success: false,
          error: response.errors?.map(e => e.description).join(', ') || 'Error uploading image'
        };
      }
    } catch (error: any) {
      console.error('❌ Error uploading brand image:', error);
      return {
        success: false,
        error: error?.message || 'Error uploading image'
      };
    }
  }

  /**
   * Obtiene todas las imágenes de una marca
   */
  async getBrandImages(brandId: number): Promise<{
    success: boolean;
    data?: BrandImagesResponseDto;
    error?: string;
  }> {
    try {
      const response = await apiClient.get<BrandImagesResponseDto>(
        `/files/brand/${brandId}/images`
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.errors?.map(e => e.description).join(', ') || 'Error getting brand images'
        };
      }
    } catch (error: any) {
      console.error('❌ Error getting brand images:', error);
      return {
        success: false,
        error: error?.message || 'Error getting brand images'
      };
    }
  }

  /**
   * Sube múltiples imágenes de marca en secuencia
   */
  async uploadMultipleBrandImages(
    images: {
      logo?: File;
      isotipo?: File;
      imagotipo?: File;
    },
    brandId: number,
    userId: number
  ): Promise<{
    success: boolean;
    results: {
      logo?: UploadResultDto;
      isotipo?: UploadResultDto;
      imagotipo?: UploadResultDto;
    };
    errors: string[];
  }> {
    const results: {
      logo?: UploadResultDto;
      isotipo?: UploadResultDto;
      imagotipo?: UploadResultDto;
    } = {};
    const errors: string[] = [];

    try {
      console.log('🚀 Starting multiple brand images upload:', {
        brandId,
        userId,
        hasLogo: !!images.logo,
        hasIsotipo: !!images.isotipo,
        hasImagotipo: !!images.imagotipo,
        logoFile: images.logo ? { name: images.logo.name, size: images.logo.size, type: images.logo.type } : null,
        isotipoFile: images.isotipo ? { name: images.isotipo.name, size: images.isotipo.size, type: images.isotipo.type } : null,
        imagotipoFile: images.imagotipo ? { name: images.imagotipo.name, size: images.imagotipo.size, type: images.imagotipo.type } : null
      });

      // Subir logo si existe
      if (images.logo) {
        console.log('📤 Uploading logo...');
        const logoResult = await this.uploadBrandImage(images.logo, brandId, 'LOGO', userId);
        results.logo = logoResult;
        console.log('📤 Logo upload result:', logoResult);
        if (!logoResult.success) {
          errors.push(`Logo: ${logoResult.error}`);
        }
      }

      // Subir isotipo si existe
      if (images.isotipo) {
        console.log('📤 Uploading isotipo...');
        const isotipoResult = await this.uploadBrandImage(images.isotipo, brandId, 'ISOTIPO', userId);
        results.isotipo = isotipoResult;
        console.log('📤 Isotipo upload result:', isotipoResult);
        if (!isotipoResult.success) {
          errors.push(`Isotipo: ${isotipoResult.error}`);
        }
      }

      // Subir imagotipo si existe
      if (images.imagotipo) {
        console.log('📤 Uploading imagotipo...');
        const imagotipoResult = await this.uploadBrandImage(images.imagotipo, brandId, 'IMAGOTIPO', userId);
        results.imagotipo = imagotipoResult;
        console.log('📤 Imagotipo upload result:', imagotipoResult);
        if (!imagotipoResult.success) {
          errors.push(`Imagotipo: ${imagotipoResult.error}`);
        }
      }

      const allSuccessful = Object.values(results).every(result => result?.success);

      console.log('📤 Multiple brand images upload completed:', {
        allSuccessful,
        results,
        errors
      });

      return {
        success: allSuccessful && errors.length === 0,
        results,
        errors
      };
    } catch (error: any) {
      console.error('❌ Error uploading multiple brand images:', error);
      return {
        success: false,
        results,
        errors: [...errors, error?.message || 'Error uploading images']
      };
    }
  }
}

export const filesService = new FilesService();
