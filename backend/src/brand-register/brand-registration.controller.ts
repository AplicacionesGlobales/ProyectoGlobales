//backend\src\brand\brand-registration.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  ValidationPipe, 
  HttpCode, 
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { BrandRegistrationService } from './brand-registration.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BaseResponseDto } from '../common/dto';
import { Public } from '../common/decorators/public-auth.decorator';

@ApiTags('Registro de Marca')
@Controller('auth')
export class BrandRegistrationController {
  constructor(private readonly brandRegistrationService: BrandRegistrationService) {}

  @Post('register/brand')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Registrar nueva marca completa',
    description: 'Crea una nueva marca con toda la información del flujo de onboarding, incluyendo imágenes base64'
  })
  @ApiBody({ type: CreateBrandDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Marca creada exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos o email ya registrado'
  })
  async registerBrand(
    @Body(ValidationPipe) createBrandDto: CreateBrandDto
  ): Promise<BaseResponseDto> {
    console.log('📥 RECEIVED REGISTRATION REQUEST:', {
      email: createBrandDto.email,
      brandName: createBrandDto.brandName,
      businessTypeId: createBrandDto.businessTypeId,
      planId: createBrandDto.planId,
      hasLogo: !!createBrandDto.logoImage,
      hasIsotipo: !!createBrandDto.isotipoImage,
      hasImagotipo: !!createBrandDto.imagotipoImage,
      selectedFeatures: createBrandDto.selectedFeatureIds.length
    });
    
    try {
      return await this.brandRegistrationService.registerBrand(createBrandDto);
      
    } catch (error) {
      console.error('❌ Registration controller error:', error);
      return BaseResponseDto.singleError(400, error.message || 'Invalid request data');
    }
  }
}
