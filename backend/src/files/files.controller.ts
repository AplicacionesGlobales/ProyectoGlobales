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
  ParseIntPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { MinioService } from './files.service';
import { CreateFileDto, FileResponseDto, FilesListResponseDto, UploadResultDto, EntityType, FileType } from './dto/file.dto';
import { BaseResponseDto } from '../common/dto';
import { Public } from '../common/decorators/public-auth.decorator';

@ApiTags('Gestión de Archivos')
@Controller('files')
export class FilesController {
  constructor(private readonly minioService: MinioService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Subir archivo a MinIO',
    description: 'Sube un archivo codificado en base64 a MinIO y guarda los metadatos en la base de datos'
  })
  @ApiBody({ type: CreateFileDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Archivo subido exitosamente',
    type: UploadResultDto
  })
  async uploadFile(
    @Body() createFileDto: CreateFileDto,
    @Query('uploadedBy') uploadedBy?: number
  ): Promise<UploadResultDto> {
    try {
      const result = await this.minioService.uploadFile(createFileDto, uploadedBy);
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
  @ApiOperation({ 
    summary: 'Reemplazar archivo de entidad',
    description: 'Reemplaza un archivo existente del mismo tipo para una entidad específica'
  })
  @ApiBody({ type: CreateFileDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Archivo reemplazado exitosamente',
    type: UploadResultDto
  })
  async replaceEntityFile(
    @Body() createFileDto: CreateFileDto,
    @Query('uploadedBy') uploadedBy?: number
  ): Promise<UploadResultDto> {
    try {
      const result = await this.minioService.replaceEntityFile(
        createFileDto.entityType,
        createFileDto.entityId,
        createFileDto.fileType,
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
