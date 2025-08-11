import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { LandingDataService } from './landing-data.service';
import { BaseResponseDto } from '../common/dto';

// DTOs para las respuestas
export interface BusinessTypeDto {
  id: number;
  key: string;
  title: string;
  subtitle?: string;
  description: string;
  icon: string;
  order: number;
  recommendedFeatures?: FeatureDto[];
}

export interface FeatureDto {
  id: number;
  key: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  category: 'ESSENTIAL' | 'BUSINESS' | 'ADVANCED';
  isRecommended: boolean;
  isPopular: boolean;
  order: number;
  businessTypes: string[];
}

export interface PlanDto {
  id: number;
  type: 'web' | 'app' | 'complete';
  name: string;
  description?: string;
  basePrice: number;
}

export interface LandingConfigDto {
  businessTypes: BusinessTypeDto[];
  features: FeatureDto[];
  plans: PlanDto[];
}

@ApiTags('Landing Data')
@Controller('landing-data')
export class LandingDataController {
  constructor(private readonly landingDataService: LandingDataService) {}

  @Get('config')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get complete landing configuration',
    description: 'Retrieve all business types, features and plans in a single optimized request'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Landing configuration retrieved successfully',
  })
  async getLandingConfig(): Promise<BaseResponseDto<LandingConfigDto>> {
    return this.landingDataService.getLandingConfig();
  }

  @Get('business-types')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all business types',
    description: 'Retrieve all active business types'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Business types retrieved successfully',
  })
  async getBusinessTypes(): Promise<BaseResponseDto<BusinessTypeDto[]>> {
    return this.landingDataService.getBusinessTypes();
  }

  @Get('features')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all features',
    description: 'Retrieve all active features'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Features retrieved successfully',
  })
  async getFeatures(): Promise<BaseResponseDto<FeatureDto[]>> {
    return this.landingDataService.getFeatures();
  }

  @Get('features/business-type/:businessType')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get features recommended for business type',
    description: 'Retrieve features recommended for a specific business type'
  })
  @ApiParam({ name: 'businessType', example: 'fotografo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Recommended features retrieved successfully',
  })
  async getFeaturesForBusinessType(
    @Param('businessType') businessType: string
  ): Promise<BaseResponseDto<FeatureDto[]>> {
    return this.landingDataService.getFeaturesForBusinessType(businessType);
  }

  @Get('plans')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all plans',
    description: 'Retrieve all active subscription plans'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Plans retrieved successfully',
  })
  async getPlans(): Promise<BaseResponseDto<PlanDto[]>> {
    return this.landingDataService.getPlans();
  }

  @Get('business-type/:businessType/config')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get business type with recommended features',
    description: 'Get a specific business type with its recommended features'
  })
  @ApiParam({ name: 'businessType', example: 'fotografo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Business type configuration retrieved successfully',
  })
  async getBusinessTypeConfig(
    @Param('businessType') businessType: string
  ): Promise<BaseResponseDto<BusinessTypeDto>> {
    return this.landingDataService.getBusinessTypeWithFeatures(businessType);
  }
}
