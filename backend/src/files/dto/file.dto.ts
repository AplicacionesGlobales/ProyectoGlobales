import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EntityType {
  BRAND = 'brand',
  USER = 'user',
  PLAN = 'plan',
  FEATURE = 'feature'
}

export enum FileType {
  LOGO = 'logo',
  ISOTOPO = 'isotipo',
  IMAGOTIPO = 'imagotipo',
  BANNER = 'banner',
  PROFILE_IMAGE = 'profile_image',
  DOCUMENT = 'document',
  ATTACHMENT = 'attachment',
  OTHER = 'other'
}

export class CreateFileDto {
  @ApiProperty({ example: 'logo.jpg' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'data:image/jpeg;base64,/9j/4AAQ...' })
  @IsString()
  base64Data: string;

  @ApiProperty({ enum: FileType, example: FileType.LOGO })
  @IsEnum(FileType)
  fileType: FileType;

  @ApiProperty({ enum: EntityType, example: EntityType.BRAND })
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiProperty({ example: 123 })
  @IsNumber()
  entityId: number;

  @ApiPropertyOptional({ example: 'images' })
  @IsString()
  @IsOptional()
  folder?: string;
}

export class FileResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'logo.jpg' })
  name: string;

  @ApiProperty({ example: 'http://localhost:9000/brand-assets/brands/123/images/logo-uuid.jpg' })
  url: string;

  @ApiProperty({ example: 'brands/123/images/logo-uuid.jpg' })
  key: string;

  @ApiProperty({ example: 'image/jpeg' })
  contentType: string;

  @ApiProperty({ example: 'logo' })
  fileType: string;

  @ApiProperty({ example: 12345 })
  size?: number;

  @ApiProperty({ example: 123 })
  entityId: number;

  @ApiProperty({ example: 'brand' })
  entityType: string;

  @ApiProperty({ example: 456 })
  uploadedBy?: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: string;
}

export class FilesListResponseDto {
  @ApiProperty({ type: [FileResponseDto] })
  files: FileResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}

export class UploadResultDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: FileResponseDto })
  file?: FileResponseDto;

  @ApiPropertyOptional({ example: 'Error message' })
  error?: string;
}