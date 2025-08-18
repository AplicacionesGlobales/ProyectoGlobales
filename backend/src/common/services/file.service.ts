import { Injectable } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class FileService {
  private readonly uploadsDir = join(process.cwd(), 'uploads');
  private readonly brandImagesDir = join(this.uploadsDir, 'brands');

  constructor() {
    this.ensureDirectoriesExist();
  }

  private async ensureDirectoriesExist() {
    if (!existsSync(this.uploadsDir)) {
      await mkdir(this.uploadsDir, { recursive: true });
    }
    if (!existsSync(this.brandImagesDir)) {
      await mkdir(this.brandImagesDir, { recursive: true });
    }
  }

  /**
   * Sube una imagen desde base64 string
   */
  async uploadBase64Image(
    brandId: number, 
    base64String: string, 
    imageType: 'logo' | 'isotipo' | 'imagotipo'
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      console.log(`🔄 Uploading ${imageType} for brand ${brandId}...`);

      // Validar formato base64
      if (!base64String.startsWith('data:image/')) {
        return {
          success: false,
          error: 'Invalid base64 image format'
        };
      }

      // Extraer información del data URL
      const matches = base64String.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return {
          success: false,
          error: 'Invalid base64 data URL format'
        };
      }

      const imageExtension = matches[1];
      const base64Data = matches[2];

      // Validar extensión
      const validExtensions = ['jpeg', 'jpg', 'png', 'webp'];
      if (!validExtensions.includes(imageExtension.toLowerCase())) {
        return {
          success: false,
          error: `Invalid image extension: ${imageExtension}`
        };
      }

      // Crear directorio específico para la marca
      const brandDir = join(this.brandImagesDir, brandId.toString());
      if (!existsSync(brandDir)) {
        await mkdir(brandDir, { recursive: true });
      }

      // Generar nombre único del archivo
      const timestamp = Date.now();
      const fileName = `${imageType}_${timestamp}.${imageExtension}`;
      const filePath = join(brandDir, fileName);

      // Convertir base64 a buffer y guardar
      const buffer = Buffer.from(base64Data, 'base64');
      await writeFile(filePath, buffer);

      // Generar URL accesible
      const publicUrl = `/uploads/brands/${brandId}/${fileName}`;

      console.log(`✅ ${imageType} uploaded successfully:`, publicUrl);

      return {
        success: true,
        url: publicUrl
      };

    } catch (error) {
      console.error(`❌ Error uploading ${imageType}:`, error);
      return {
        success: false,
        error: error.message || 'Upload failed'
      };
    }
  }

  /**
   * Elimina una imagen de marca
   */
  async deleteBrandImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!imageUrl) return { success: true };

      // Extraer ruta del archivo desde la URL
      const urlParts = imageUrl.split('/uploads/');
      if (urlParts.length !== 2) {
        return {
          success: false,
          error: 'Invalid image URL format'
        };
      }

      const filePath = join(this.uploadsDir, urlParts[1]);
      
      if (existsSync(filePath)) {
        const { unlink } = await import('fs/promises');
        await unlink(filePath);
        console.log('✅ Image deleted:', filePath);
      }

      return { success: true };

    } catch (error) {
      console.error('❌ Error deleting image:', error);
      return {
        success: false,
        error: error.message || 'Delete failed'
      };
    }
  }

  /**
   * Valida el tamaño de una imagen base64
   */
  validateBase64ImageSize(base64String: string, maxSizeInMB: number = 5): boolean {
    try {
      // Calcular tamaño aproximado del archivo
      const base64Data = base64String.split(',')[1] || base64String;
      const sizeInBytes = (base64Data.length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      return sizeInMB <= maxSizeInMB;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene información de una imagen base64
   */
  getBase64ImageInfo(base64String: string): { 
    mimeType?: string; 
    extension?: string; 
    sizeInMB?: number; 
    isValid: boolean 
  } {
    try {
      if (!base64String.startsWith('data:image/')) {
        return { isValid: false };
      }

      const matches = base64String.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return { isValid: false };
      }

      const extension = matches[1];
      const base64Data = matches[2];
      const mimeType = `image/${extension}`;
      
      // Calcular tamaño
      const sizeInBytes = (base64Data.length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);

      return {
        mimeType,
        extension,
        sizeInMB: Math.round(sizeInMB * 100) / 100,
        isValid: true
      };

    } catch (error) {
      return { isValid: false };
    }
  }
}
