// backend/src/brand-register/brand-registration.controller.ts
import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { BrandRegistrationService } from './brand-registration.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BaseResponseDto } from '../common/dto';
import { Public } from '../common/decorators/public-auth.decorator';

@ApiTags('Registro de Marca')
@Controller('auth')
export class BrandRegistrationController {
  constructor(
    private readonly brandRegistrationService: BrandRegistrationService,
  ) {}

  @Post('register/brand')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar nueva marca completa',
    description: `Crea una nueva marca con toda la información del flujo de onboarding. 
    Incluye:
    - Creación de usuario administrador (ROOT)
    - Configuración de la marca
    - Selección de plan y features
    - Paleta de colores
    - Configuración de citas y tipos de servicio (opcional)
    - Las imágenes se suben posteriormente mediante el endpoint /files/brand-images`,
  })
  @ApiBody({ type: CreateBrandDto })
  @ApiResponse({
    status: 201,
    description: 'Marca creada exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          message: 'Marca registrada exitosamente',
          userId: 123,
          brandId: 456,
          email: 'usuario@ejemplo.com',
          brandName: 'Mi Empresa',
          serviceTypesCreated: 3,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o email ya registrado',
    schema: {
      example: {
        success: false,
        errors: [
          {
            code: 400,
            description: 'El email ya está registrado',
          },
        ],
      },
    },
  })
  async registerBrand(
    @Body(ValidationPipe) createBrandDto: CreateBrandDto,
  ): Promise<BaseResponseDto> {
    // Logging mejorado para incluir configuración de citas
    console.log('📥 RECEIVED REGISTRATION REQUEST:', {
      email: createBrandDto.email,
      brandName: createBrandDto.brandName,
      businessTypeId: createBrandDto.businessTypeId,
      planId: createBrandDto.planId,
      selectedFeatures: createBrandDto.selectedFeatureIds.length,
      appointmentSettings: {
        enabled: createBrandDto.appointmentSettings?.useServiceTypes || false,
        serviceTypes:
          createBrandDto.appointmentSettings?.serviceTypes?.length || 0,
        defaultDuration:
          createBrandDto.appointmentSettings?.defaultDuration || 30,
      },
    });

    try {
      return await this.brandRegistrationService.registerBrand(createBrandDto);
    } catch (error) {
      console.error('❌ Registration controller error:', error);

      // Manejo específico de errores de validación de tipos de servicio
      if (
        error.message?.includes('duración') ||
        error.message?.includes('múltiplo')
      ) {
        return BaseResponseDto.singleError(400, error.message);
      }

      // Manejo de errores de duplicación
      if (
        error.message?.includes('ya existe') ||
        error.message?.includes('already exists')
      ) {
        return BaseResponseDto.singleError(400, error.message);
      }

      // Error genérico
      return BaseResponseDto.singleError(
        400,
        error.message || 'Invalid request data',
      );
    }
  }
}
