import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface FileUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', 'uploads');
    this.baseUrl = this.configService.get('BASE_URL', 'http://localhost:3000');
  }

  async onModuleInit() {
    // Crear directorio de uploads si no existe
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'brands'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'brands', 'logos'), { recursive: true });
    } catch (error) {
      this.logger.error('Error creating upload directories', error);
    }
  }

  /**
   * Sube archivo de imagen para una marca
   */
  async uploadBrandImage(
    brandId: number,
    file: UploadedFile,
    type: 'logo' | 'isotopo' | 'imagotipo'
  ): Promise<FileUploadResult> {
    try {
      // Validar archivo
      const validation = this.validateImageFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Generar nombre único
      const extension = path.extname(file.originalname).toLowerCase();
      const hash = crypto.createHash('md5').update(file.buffer).digest('hex');
      const filename = `${brandId}_${type}_${hash}${extension}`;
      
      // Ruta completa
      const brandDir = path.join(this.uploadDir, 'brands', brandId.toString());
      await fs.mkdir(brandDir, { recursive: true });
      
      const filePath = path.join(brandDir, filename);
      
      // Escribir archivo
      await fs.writeFile(filePath, file.buffer);
      
      // Retornar URL pública
      const publicUrl = `${this.baseUrl}/uploads/brands/${brandId}/${filename}`;
      
      this.logger.log(`Image uploaded successfully: ${publicUrl}`);
      return { success: true, url: publicUrl };
      
    } catch (error) {
      this.logger.error('Error uploading file', error);
      return { success: false, error: 'Error uploading file' };
    }
  }

  /**
   * Valida si el archivo es una imagen válida
   */
  private validateImageFile(file: UploadedFile): { valid: boolean; error?: string } {
    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large. Maximum size is 5MB' };
    }

    // Validar tipo MIME
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP and SVG are allowed' };
    }

    // Validar extensión
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return { valid: false, error: 'Invalid file extension' };
    }

    return { valid: true };
  }

  /**
   * Elimina archivo existente (para actualizaciones)
   */
  async deleteFile(url: string): Promise<void> {
    try {
      if (url?.includes('/uploads/')) {
        const relativePath = url.split('/uploads/')[1];
        const fullPath = path.join(this.uploadDir, relativePath);
        await fs.unlink(fullPath);
        this.logger.log(`File deleted: ${fullPath}`);
      }
    } catch (error) {
      this.logger.error('Error deleting file', error);
    }
  }
}
