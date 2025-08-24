import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { MinioService } from './files.service';
import { CreateFileDto, FileResponseDto, FilesListResponseDto, UploadResultDto, EntityType, FileType } from './dto/file.dto';
import { BrandImageType, BrandImagesResponseDto } from './dto/brand-image.dto';
import { BaseResponseDto } from '../common/dto';
import { Public } from '../common/decorators/public-auth.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Gestión de Archivos')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly minioService: MinioService) { }

  @Post('brand-images')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir imagen de marca',
    description: 'Sube una imagen específica de marca (logo, isotipo o imagotipo) y la asocia con el usuario y la marca'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        brandId: {
          type: 'number',
          description: 'ID de la marca'
        },
        imageType: {
          type: 'string',
          enum: Object.values(BrandImageType),
          description: 'Tipo de imagen de marca'
        },
        userId: {
          type: 'number',
          description: 'ID del usuario que sube la imagen'
        }
      },
      required: ['file', 'brandId', 'imageType', 'userId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Imagen de marca subida exitosamente',
    type: UploadResultDto
  })
  async uploadBrandImage(
    @UploadedFile() file: any,
    @Body('brandId', ParseIntPipe) brandId: number,
    @Body('imageType') imageType: BrandImageType,
    @Body('userId', ParseIntPipe) userId: number
  ): Promise<UploadResultDto> {
    try {
      const result = await this.minioService.uploadBrandImage(
        file,
        brandId,
        imageType,
        userId
      );
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get('brand/:brandId/images')
  @Public()
  @ApiOperation({
    summary: 'Obtener imágenes de marca',
    description: 'Obtiene todas las imágenes (logo, isotipo, imagotipo) de una marca específica'
  })
  @ApiResponse({
    status: 200,
    description: 'Imágenes de la marca',
    type: BrandImagesResponseDto
  })
  async getBrandImages(
    @Param('brandId', ParseIntPipe) brandId: number
  ): Promise<BrandImagesResponseDto> {
    return await this.minioService.getBrandImages(brandId);
  }

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir archivo a MinIO',
    description: 'Sube un archivo mediante FormData a MinIO y guarda los metadatos en la base de datos'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        fileType: {
          type: 'string',
          enum: Object.values(FileType),
        },
        entityType: {
          type: 'string',
          enum: Object.values(EntityType),
        },
        entityId: {
          type: 'number',
        },
        folder: {
          type: 'string',
        },
      },
      required: ['file', 'fileType', 'entityType', 'entityId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo subido exitosamente',
    type: UploadResultDto
  })
  async uploadFile(
    @UploadedFile() file: any,
    @Body() createFileDto: CreateFileDto,
    @Query('uploadedBy') uploadedBy?: number
  ): Promise<UploadResultDto> {
    try {
      const result = await this.minioService.uploadFile(file, createFileDto, uploadedBy);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({
    summary: 'Obtener archivos por entidad',
    description: 'Obtiene todos los archivos asociados a una entidad específica'
  })
  @ApiQuery({ name: 'fileType', required: false, enum: FileType })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Lista de archivos',
    type: FilesListResponseDto
  })
  async getFilesByEntity(
    @Param('entityType') entityType: EntityType,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Query('fileType') fileType?: FileType,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10
  ): Promise<FilesListResponseDto> {
    const result = await this.minioService.getFilesByEntity(
      entityType,
      entityId,
      fileType,
      page,
      limit
    );

    return {
      files: result.files,
      total: result.total,
      page,
      limit
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener archivo por ID',
    description: 'Obtiene un archivo específico por su ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Información del archivo',
    type: FileResponseDto
  })
  async getFileById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<FileResponseDto | null> {
    return await this.minioService.getFileById(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar archivo',
    description: 'Elimina un archivo tanto de MinIO como de la base de datos'
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo eliminado exitosamente'
  })
  async deleteFile(
    @Param('id', ParseIntPipe) id: number,
    @Query('requestingUserId') requestingUserId?: number
  ): Promise<BaseResponseDto<{ deleted: boolean }>> {
    try {
      const deleted = await this.minioService.deleteFile(id, requestingUserId);
      return BaseResponseDto.success({ deleted });
    } catch (error) {
      return BaseResponseDto.singleError(500, error.message);
    }
  }

  @Post('replace')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Reemplazar archivo de entidad',
    description: 'Reemplaza un archivo existente del mismo tipo para una entidad específica'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        fileType: {
          type: 'string',
          enum: Object.values(FileType),
        },
        entityType: {
          type: 'string',
          enum: Object.values(EntityType),
        },
        entityId: {
          type: 'number',
        },
        folder: {
          type: 'string',
        },
      },
      required: ['file', 'fileType', 'entityType', 'entityId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo reemplazado exitosamente',
    type: UploadResultDto
  })
  async replaceEntityFile(
    @UploadedFile() file: any,
    @Body() createFileDto: CreateFileDto,
    @Query('uploadedBy') uploadedBy?: number
  ): Promise<UploadResultDto> {
    try {
      const result = await this.minioService.replaceEntityFile(
        createFileDto.entityType,
        createFileDto.entityId,
        createFileDto.fileType,
        file,
        createFileDto,
        uploadedBy
      );
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get(':id/presigned-url')
  @Public()
  @ApiOperation({
    summary: 'Obtener URL firmada',
    description: 'Genera una URL firmada temporal para acceso directo al archivo'
  })
  @ApiQuery({ name: 'expiry', required: false, type: Number, example: 3600 })
  @ApiResponse({
    status: 200,
    description: 'URL firmada generada'
  })
  async getPresignedUrl(
    @Param('id', ParseIntPipe) id: number,
    @Query('expiry', ParseIntPipe) expiry: number = 7 * 24 * 60 * 60
  ): Promise<BaseResponseDto<{ url: string }>> {
    try {
      const url = await this.minioService.getPresignedUrl(id, expiry);
      return BaseResponseDto.success({ url });
    } catch (error) {
      return BaseResponseDto.singleError(500, error.message);
    }
  }

  @Get('stats/storage')
  @Public()
  @ApiOperation({
    summary: 'Estadísticas de almacenamiento',
    description: 'Obtiene estadísticas generales del almacenamiento de archivos'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de almacenamiento'
  })
  async getStorageStats(): Promise<BaseResponseDto<any>> {
    try {
      const stats = await this.minioService.getStorageStats();
      return BaseResponseDto.success(stats);
    } catch (error) {
      return BaseResponseDto.singleError(500, error.message);
    }
  }
}
