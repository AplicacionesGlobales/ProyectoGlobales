import { 
  Controller, 
  Post, 
  Body, 
  ValidationPipe, 
  HttpCode, 
  HttpStatus, 
  UseInterceptors,
  UploadedFiles
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BaseResponseDto } from '../common/dto';
import { BrandRegistrationResponseDto } from './dto/brand-registration-response.dto';

@ApiTags('Registro de Marca')
@Controller('auth')
export class BrandRegistrationController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/brand')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Registrar nueva marca completa',
    description: 'Crea una nueva marca con toda la información del flujo de onboarding, incluyendo archivos opcionales'
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FilesInterceptor('files', 3, {
    fileFilter: (req, file, callback) => {
      // Solo permitir imágenes
      if (file.mimetype.match(/\/(jpg|jpeg|png|webp|svg)$/)) {
        callback(null, true);
      } else {
        callback(new Error('Only image files are allowed!'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB máximo por archivo
      files: 3 // Máximo 3 archivos (logo, isotopo, imagotipo)
    }
  }))
  @ApiResponse({ 
    status: 201, 
    description: 'Marca creada exitosamente',
    type: () => BaseResponseDto<BrandRegistrationResponseDto>
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos o email ya registrado'
  })
  async registerBrand(
    @Body(ValidationPipe) body: any, // Será parseado manualmente para FormData
    @UploadedFiles() files?: any[]
  ): Promise<BaseResponseDto<BrandRegistrationResponseDto>> {
    // Parsear datos del cuerpo (para FormData los JSON vienen como strings)
    let createBrandDto: CreateBrandDto;
    
    try {
      // Si hay archivos, es FormData - parsear campos JSON
      if (files && files.length > 0) {
        createBrandDto = this.parseFormDataBody(body);
      } else {
        // Es JSON normal
        createBrandDto = body as CreateBrandDto;
      }

      // Agregar archivos al DTO
      if (files) {
        const fileMap = this.mapUploadedFiles(files);
        createBrandDto.logoFile = fileMap.logoFile;
        createBrandDto.isotopoFile = fileMap.isotopoFile;
        createBrandDto.imagotipoFile = fileMap.imagotipoFile;
      }

      return await this.authService.registerBrand(createBrandDto);
      
    } catch (error) {
      return BaseResponseDto.singleError(400, error.message || 'Invalid request data');
    }
  }

  /**
   * Parsea el cuerpo de FormData convirtiendo campos JSON stringificados
   */
  private parseFormDataBody(body: any): CreateBrandDto {
    const dto: any = { ...body };

    // Campos que vienen como JSON stringificados en FormData
    const jsonFields = ['colorPalette', 'selectedFeatures', 'customColors', 'plan'];
    
    for (const field of jsonFields) {
      if (dto[field] && typeof dto[field] === 'string') {
        try {
          dto[field] = JSON.parse(dto[field]);
        } catch (error) {
          throw new Error(`Invalid JSON in field ${field}`);
        }
      }
    }

    return dto as CreateBrandDto;
  }

  /**
   * Mapea los archivos subidos por su fieldname
   */
  private mapUploadedFiles(files: any[]) {
    const fileMap: any = {};
    
    for (const file of files) {
      switch (file.fieldname) {
        case 'logoFile':
          fileMap.logoFile = file;
          break;
        case 'isotopoFile':
          fileMap.isotopoFile = file;
          break;
        case 'imagotipoFile':
          fileMap.imagotipoFile = file;
          break;
      }
    }

    return fileMap;
  }
}
