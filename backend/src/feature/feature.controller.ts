import { Controller, Get, Post, Put, Delete, Body, Param, Query, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FeatureService } from './feature.service';
import { 
  CreateFeatureDto, 
  UpdateFeatureDto, 
  FeatureDto, 
  FeaturesByBusinessTypeDto 
} from './dto';
import { BaseResponseDto } from '../common/dto';

@ApiTags('Features')
@Controller('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all features',
    description: 'Retrieve all active features ordered by category and order'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Features retrieved successfully',
    type: () => BaseResponseDto
  })
  async getAllFeatures(): Promise<BaseResponseDto<FeatureDto[]>> {
    return this.featureService.getAllFeatures();
  }

  @Get('business-type/:businessType')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get features by business type',
    description: 'Retrieve features recommended for a specific business type'
  })
  @ApiParam({ name: 'businessType', example: 'photographer' })
  @ApiResponse({ 
    status: 200, 
    description: 'Features retrieved successfully',
    type: () => BaseResponseDto
  })
  async getFeaturesByBusinessType(
    @Param('businessType') businessType: string
  ): Promise<BaseResponseDto<FeatureDto[]>> {
    return this.featureService.getFeaturesByBusinessType(businessType);
  }

  @Get('recommended')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get recommended features',
    description: 'Retrieve all recommended features, optionally filtered by business type'
  })
  @ApiQuery({ name: 'businessType', required: false, example: 'photographer' })
  @ApiResponse({ 
    status: 200, 
    description: 'Recommended features retrieved successfully',
    type: () => BaseResponseDto
  })
  async getRecommendedFeatures(
    @Query('businessType') businessType?: string
  ): Promise<BaseResponseDto<FeatureDto[]>> {
    return this.featureService.getRecommendedFeatures(businessType);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new feature',
    description: 'Create a new feature (admin only)'
  })
  @ApiBody({ type: CreateFeatureDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Feature created successfully',
    type: () => BaseResponseDto
  })
  async createFeature(
    @Body(ValidationPipe) createFeatureDto: CreateFeatureDto
  ): Promise<BaseResponseDto<FeatureDto>> {
    return this.featureService.createFeature(createFeatureDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update a feature',
    description: 'Update an existing feature (admin only)'
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateFeatureDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Feature updated successfully',
    type: () => BaseResponseDto
  })
  async updateFeature(
    @Param('id') id: string,
    @Body(ValidationPipe) updateFeatureDto: UpdateFeatureDto
  ): Promise<BaseResponseDto<FeatureDto>> {
    return this.featureService.updateFeature(parseInt(id), updateFeatureDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete a feature',
    description: 'Soft delete a feature (admin only)'
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ 
    status: 200, 
    description: 'Feature deleted successfully',
    type: () => BaseResponseDto
  })
  async deleteFeature(
    @Param('id') id: string
  ): Promise<BaseResponseDto<{ deleted: boolean }>> {
    return this.featureService.deleteFeature(parseInt(id));
  }
}
