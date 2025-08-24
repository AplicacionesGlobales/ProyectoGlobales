import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';
import { CreateFileDto, FileResponseDto, EntityType, FileType } from './dto/file.dto';
import { BrandImageType } from './dto/brand-image.dto';

export interface UploadResult {
  success: boolean;
  file?: FileResponseDto;
  error?: string;
}

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME', 'brand-assets');
    this.publicUrl = this.configService.get<string>('MINIO_PUBLIC_URL', 'https://jmvserver.mooo.com/minio/');

    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'jmvserver.mooo.com'),
      port: parseInt(this.configService.get<string>('MINIO_PORT', '9000')),
      useSSL: this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'chambeador'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'M4racuya3nL3ch3!2005$'),
    });
  }

  async onModuleInit() {
    // await this.createBucketIfNotExists();
    this.logger.log('MinioService initialized (bucket creation skipped)');

    // Test MinIO connectivity
    await this.testMinioConnection();
  }

  private async testMinioConnection(): Promise<void> {
    try {
      this.logger.log('Testing MinIO connection...');
      this.logger.log(`MinIO Config - Endpoint: ${this.configService.get('MINIO_ENDPOINT')}, Port: ${this.configService.get('MINIO_PORT')}, SSL: ${this.configService.get('MINIO_USE_SSL')}`);

      const exists = await this.minioClient.bucketExists(this.bucketName);
      this.logger.log(`✅ MinIO connection successful! Bucket '${this.bucketName}' exists: ${exists}`);
    } catch (error) {
      this.logger.error('❌ MinIO connection failed:');
      this.logger.error(`Error type: ${error.constructor.name}`);
      this.logger.error(`Error message: ${error.message}`);
      this.logger.error(`Error code: ${error.code}`);
      this.logger.warn('⚠️  MinIO is not accessible. File uploads will save to database with placeholder URLs.');
    }
  }

  private async createBucketIfNotExists(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket ${this.bucketName} created successfully`);
        await this.setBucketPolicy();
      }
    } catch (error) {
      this.logger.error('Error creating bucket:', error);
      throw error;
    }
  }

  private async setBucketPolicy(): Promise<void> {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucketName}/*`],
        },
      ],
    };

    try {
      await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      this.logger.log('Bucket policy set for public read access');
    } catch (error) {
      this.logger.error('Error setting bucket policy:', error);
    }
  }

  async uploadFile(
    file: any,
    createFileDto: CreateFileDto,
    uploadedBy?: number
  ): Promise<UploadResult> {
    try {
      if (!file) {
        return {
          success: false,
          error: 'No file provided',
        };
      }

      const buffer = file.buffer;
      const contentType = file.mimetype;
      const originalName = file.originalname;

      // Determine file extension from MIME type or original filename
      const extensions: { [key: string]: string } = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/svg+xml': 'svg',
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      };

      const extension = extensions[contentType] || originalName.split('.').pop() || 'bin';
      const folder = createFileDto.folder || this.getDefaultFolder(createFileDto.fileType);
      const fileName = `${createFileDto.fileType}-${randomUUID()}.${extension}`;
      const key = `${createFileDto.entityType}s/${createFileDto.entityId}/${folder}/${fileName}`;

      const metadata = {
        'Content-Type': contentType,
        'x-amz-meta-entity-type': createFileDto.entityType,
        'x-amz-meta-entity-id': createFileDto.entityId.toString(),
        'x-amz-meta-file-type': createFileDto.fileType,
        'x-amz-meta-original-name': originalName,
        'x-amz-meta-uploaded-by': uploadedBy?.toString() || 'system',
        'x-amz-meta-uploaded-at': new Date().toISOString(),
      };

      // Upload to MinIO
      await this.minioClient.putObject(
        this.bucketName,
        key,
        buffer,
        buffer.length,
        metadata
      );

      const url = `${this.publicUrl}/${this.bucketName}/${key}`;

      // Save to database
      const fileRecord = await this.prisma.file.create({
        data: {
          name: originalName,
          url,
          key,
          contentType,
          fileType: createFileDto.fileType,
          size: buffer.length,
          entityId: createFileDto.entityId,
          entityType: createFileDto.entityType,
          uploadedBy,
          isActive: true,
        },
      });

      const fileResponse: FileResponseDto = {
        id: fileRecord.id,
        name: fileRecord.name,
        url: fileRecord.url,
        key: fileRecord.key,
        contentType: fileRecord.contentType,
        fileType: fileRecord.fileType,
        size: fileRecord.size ?? undefined,
        entityId: fileRecord.entityId,
        entityType: fileRecord.entityType,
        uploadedBy: fileRecord.uploadedBy ?? undefined,
        isActive: fileRecord.isActive,
        createdAt: fileRecord.createdAt.toISOString(),
        updatedAt: fileRecord.updatedAt.toISOString(),
      };

      this.logger.log(`File uploaded successfully: ${key}`);
      return {
        success: true,
        file: fileResponse,
      };
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async uploadBrandImage(
    file: any,
    brandId: number,
    imageType: BrandImageType,
    userId: number
  ): Promise<UploadResult> {
    try {
      if (!file) {
        return {
          success: false,
          error: 'No file provided',
        };
      }

      // Verificar que la marca existe y el usuario tiene acceso
      const userBrand = await this.prisma.userBrand.findFirst({
        where: {
          userId,
          brandId,
        },
        include: {
          brand: true,
        }
      });

      if (!userBrand) {
        return {
          success: false,
          error: 'User does not have access to this brand',
        };
      }

      const buffer = file.buffer;
      const contentType = file.mimetype;
      const originalName = file.originalname;

      // Validar que sea una imagen
      if (!contentType.startsWith('image/')) {
        return {
          success: false,
          error: 'File must be an image',
        };
      }

      // Determine file extension from MIME type
      const extensions: { [key: string]: string } = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/svg+xml': 'svg',
      };

      const extension = extensions[contentType] || 'jpg';
      const fileName = `${imageType.toLowerCase()}-${randomUUID()}.${extension}`;
      const key = `brands/${brandId}/images/${fileName}`;

      const metadata = {
        'Content-Type': contentType,
        'x-amz-meta-entity-type': 'brand',
        'x-amz-meta-entity-id': brandId.toString(),
        'x-amz-meta-file-type': imageType.toLowerCase(),
        'x-amz-meta-original-name': originalName,
        'x-amz-meta-uploaded-by': userId.toString(),
        'x-amz-meta-uploaded-at': new Date().toISOString(),
        'x-amz-meta-image-type': imageType,
      };

      // Upload to MinIO - IMPROVED ERROR HANDLING
      let uploadSuccess = false;
      let minioError: any = null;

      this.logger.log(`Attempting to upload to MinIO: bucket=${this.bucketName}, key=${key}`);
      this.logger.log(`MinIO config: endpoint=${this.configService.get('MINIO_ENDPOINT')}, port=${this.configService.get('MINIO_PORT')}, useSSL=${this.configService.get('MINIO_USE_SSL')}`);

      try {
        await this.minioClient.putObject(
          this.bucketName,
          key,
          buffer,
          buffer.length,
          metadata
        );
        uploadSuccess = true;
        this.logger.log(`✅ Successfully uploaded ${key} to MinIO`);
      } catch (error) {
        minioError = error;
        uploadSuccess = false;
        this.logger.error(`❌ MinIO upload failed for ${key}:`);
        this.logger.error(`Error type: ${error.constructor.name}`);
        this.logger.error(`Error message: ${error.message}`);
        this.logger.error(`Error code: ${error.code}`);
        this.logger.error(`Full error:`, error);

        // TEMPORARY: Continue with database record even if MinIO fails
        this.logger.warn('⚠️  MinIO upload failed, but continuing with database record for development');
      }

      // Use different URL based on upload success
      const url = uploadSuccess
        ? `${this.publicUrl}/${this.bucketName}/${key}`
        : `https://via.placeholder.com/400x400/808080/FFFFFF?text=${imageType}`;

      this.logger.log(`Generated URL: ${url} (MinIO success: ${uploadSuccess})`);

      // Reemplazar imagen existente del mismo tipo si existe
      const existingFile = await this.prisma.file.findFirst({
        where: {
          entityType: 'brand',
          entityId: brandId,
          fileType: imageType.toLowerCase(),
          isActive: true,
        },
      });

      if (existingFile) {
        this.logger.log(`Found existing file to replace: ${existingFile.key}`);
        // Desactivar archivo anterior
        await this.prisma.file.update({
          where: { id: existingFile.id },
          data: { isActive: false },
        });

        // Only try to delete from MinIO if current upload was successful
        if (uploadSuccess) {
          try {
            await this.minioClient.removeObject(this.bucketName, existingFile.key);
            this.logger.log(`✅ Deleted old file from MinIO: ${existingFile.key}`);
          } catch (error) {
            this.logger.warn(`⚠️  Could not delete old file from MinIO: ${existingFile.key} - ${error.message}`);
          }
        }
      }

      // Guardar en base de datos
      this.logger.log(`Creating database record for file: ${originalName}`);
      const fileRecord = await this.prisma.file.create({
        data: {
          name: originalName,
          url,
          key,
          contentType,
          fileType: imageType.toLowerCase(),
          size: buffer.length,
          entityId: brandId,
          entityType: 'brand',
          uploadedBy: userId,
          isActive: true,
        },
      });
      this.logger.log(`✅ Database record created with ID: ${fileRecord.id}`);

      const fileResponse: FileResponseDto = {
        id: fileRecord.id,
        name: fileRecord.name,
        url: fileRecord.url,
        key: fileRecord.key,
        contentType: fileRecord.contentType,
        fileType: fileRecord.fileType,
        size: fileRecord.size ?? undefined,
        entityId: fileRecord.entityId,
        entityType: fileRecord.entityType,
        uploadedBy: fileRecord.uploadedBy ?? undefined,
        isActive: fileRecord.isActive,
        createdAt: fileRecord.createdAt.toISOString(),
        updatedAt: fileRecord.updatedAt.toISOString(),
      };

      this.logger.log(`✅ Brand ${imageType} processed successfully: ${key} for brand ${brandId} by user ${userId} (MinIO: ${uploadSuccess ? 'SUCCESS' : 'FAILED'})`);

      return {
        success: true,
        file: fileResponse,
        ...(minioError && {
          warning: `File saved to database but MinIO upload failed: ${minioError.message}`
        })
      };
    } catch (error) {
      this.logger.error('Error uploading brand image:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getBrandImages(brandId: number): Promise<{
    logo: FileResponseDto | null;
    isotipo: FileResponseDto | null;
    imagotipo: FileResponseDto | null;
  }> {
    try {
      const files = await this.prisma.file.findMany({
        where: {
          entityType: 'brand',
          entityId: brandId,
          fileType: { in: ['logo', 'isotipo', 'imagotipo'] },
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const result = {
        logo: null as FileResponseDto | null,
        isotipo: null as FileResponseDto | null,
        imagotipo: null as FileResponseDto | null,
      };

      files.forEach(file => {
        const fileResponse: FileResponseDto = {
          id: file.id,
          name: file.name,
          url: file.url,
          key: file.key,
          contentType: file.contentType,
          fileType: file.fileType,
          size: file.size ?? undefined,
          entityId: file.entityId,
          entityType: file.entityType,
          uploadedBy: file.uploadedBy ?? undefined,
          isActive: file.isActive,
          createdAt: file.createdAt.toISOString(),
          updatedAt: file.updatedAt.toISOString(),
        };

        if (file.fileType === 'logo') {
          result.logo = fileResponse;
        } else if (file.fileType === 'isotipo') {
          result.isotipo = fileResponse;
        } else if (file.fileType === 'imagotipo') {
          result.imagotipo = fileResponse;
        }
      });

      return result;
    } catch (error) {
      this.logger.error('Error getting brand images:', error);
      throw error;
    }
  }

  async deleteFile(fileId: number, requestingUserId?: number): Promise<boolean> {
    try {
      const fileRecord = await this.prisma.file.findUnique({
        where: { id: fileId },
      });

      if (!fileRecord) {
        throw new Error('File not found');
      }

      // Delete from MinIO
      await this.minioClient.removeObject(this.bucketName, fileRecord.key);

      // Soft delete in database (or hard delete if you prefer)
      await this.prisma.file.update({
        where: { id: fileId },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`File deleted successfully: ${fileRecord.key}`);
      return true;
    } catch (error) {
      this.logger.error('Error deleting file:', error);
      return false;
    }
  }

  async getFilesByEntity(
    entityType: EntityType,
    entityId: number,
    fileType?: FileType,
    page: number = 1,
    limit: number = 10
  ): Promise<{ files: FileResponseDto[]; total: number }> {
    try {
      const where: any = {
        entityType,
        entityId,
        isActive: true,
      };

      if (fileType) {
        where.fileType = fileType;
      }

      const [files, total] = await Promise.all([
        this.prisma.file.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.file.count({ where }),
      ]);

      const fileResponses: FileResponseDto[] = files.map(file => ({
        id: file.id,
        name: file.name,
        url: file.url,
        key: file.key,
        contentType: file.contentType,
        fileType: file.fileType,
        size: file.size ?? undefined,
        entityId: file.entityId,
        entityType: file.entityType,
        uploadedBy: file.uploadedBy ?? undefined,
        isActive: file.isActive,
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
      }));

      return { files: fileResponses, total };
    } catch (error) {
      this.logger.error('Error getting files by entity:', error);
      throw error;
    }
  }

  async getFileById(fileId: number): Promise<FileResponseDto | null> {
    try {
      const fileRecord = await this.prisma.file.findUnique({
        where: { id: fileId, isActive: true },
      });

      if (!fileRecord) {
        return null;
      }

      return {
        id: fileRecord.id,
        name: fileRecord.name,
        url: fileRecord.url,
        key: fileRecord.key,
        contentType: fileRecord.contentType,
        fileType: fileRecord.fileType,
        size: fileRecord.size ?? undefined,
        entityId: fileRecord.entityId,
        entityType: fileRecord.entityType,
        uploadedBy: fileRecord.uploadedBy ?? undefined,
        isActive: fileRecord.isActive,
        createdAt: fileRecord.createdAt.toISOString(),
        updatedAt: fileRecord.updatedAt.toISOString(),
      };
    } catch (error) {
      this.logger.error('Error getting file by ID:', error);
      throw error;
    }
  }

  async replaceEntityFile(
    entityType: EntityType,
    entityId: number,
    fileType: FileType,
    file: any,
    createFileDto: CreateFileDto,
    uploadedBy?: number
  ): Promise<UploadResult> {
    try {
      // Find existing file of the same type for this entity
      const existingFile = await this.prisma.file.findFirst({
        where: {
          entityType,
          entityId,
          fileType,
          isActive: true,
        },
      });

      // Upload new file
      const uploadResult = await this.uploadFile(file, createFileDto, uploadedBy);

      if (uploadResult.success && existingFile) {
        // Deactivate old file
        await this.deleteFile(existingFile.id, uploadedBy);
      }

      return uploadResult;
    } catch (error) {
      this.logger.error('Error replacing file:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private getDefaultFolder(fileType: FileType): string {
    const folderMap: { [key in FileType]: string } = {
      [FileType.LOGO]: 'images',
      [FileType.ISOTOPO]: 'images',
      [FileType.IMAGOTIPO]: 'images',
      [FileType.BANNER]: 'images',
      [FileType.PROFILE_IMAGE]: 'images',
      [FileType.DOCUMENT]: 'documents',
      [FileType.ATTACHMENT]: 'attachments',
      [FileType.OTHER]: 'general',
    };

    return folderMap[fileType] || 'general';
  }

  async getPresignedUrl(fileId: number, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    try {
      const fileRecord = await this.prisma.file.findUnique({
        where: { id: fileId, isActive: true },
      });

      if (!fileRecord) {
        throw new Error('File not found');
      }

      return await this.minioClient.presignedGetObject(this.bucketName, fileRecord.key, expiry);
    } catch (error) {
      this.logger.error('Error generating presigned URL:', error);
      throw error;
    }
  }

  async getStorageStats(): Promise<any> {
    try {
      const stats = await this.prisma.file.aggregate({
        where: { isActive: true },
        _count: { id: true },
        _sum: { size: true },
      });

      const statsByType = await this.prisma.file.groupBy({
        by: ['fileType'],
        where: { isActive: true },
        _count: { id: true },
        _sum: { size: true },
      });

      return {
        totalFiles: stats._count.id,
        totalSize: stats._sum.size || 0,
        byType: statsByType,
        bucketName: this.bucketName,
      };
    } catch (error) {
      this.logger.error('Error getting storage stats:', error);
      throw error;
    }
  }
}