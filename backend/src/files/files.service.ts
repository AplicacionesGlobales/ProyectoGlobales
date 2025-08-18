import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';
import { CreateFileDto, FileResponseDto, EntityType, FileType } from './dto/file.dto';

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
    this.publicUrl = this.configService.get<string>('MINIO_PUBLIC_URL', 'http://localhost:9000');
    
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.configService.get<string>('MINIO_PORT', '9000')),
      useSSL: this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
    });
  }

  async onModuleInit() {
    await this.createBucketIfNotExists();
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
    createFileDto: CreateFileDto,
    uploadedBy?: number
  ): Promise<UploadResult> {
    try {
      // Extract MIME type and data from base64 string
      const matches = createFileDto.base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return {
          success: false,
          error: 'Invalid base64 format',
        };
      }

      const contentType = matches[1];
      const data = matches[2];
      const buffer = Buffer.from(data, 'base64');

      // Determine file extension from MIME type
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

      const extension = extensions[contentType] || 'bin';
      const folder = createFileDto.folder || this.getDefaultFolder(createFileDto.fileType);
      const fileName = `${createFileDto.fileType}-${randomUUID()}.${extension}`;
      const key = `${createFileDto.entityType}s/${createFileDto.entityId}/${folder}/${fileName}`;

      const metadata = {
        'Content-Type': contentType,
        'x-amz-meta-entity-type': createFileDto.entityType,
        'x-amz-meta-entity-id': createFileDto.entityId.toString(),
        'x-amz-meta-file-type': createFileDto.fileType,
        'x-amz-meta-original-name': createFileDto.name,
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
          name: createFileDto.name,
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
      const uploadResult = await this.uploadFile(createFileDto, uploadedBy);

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