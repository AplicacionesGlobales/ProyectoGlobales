import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ColorPaletteService } from './color-palette.service';
import { BaseResponseDto } from '../common/dto';
import { CreateColorPaletteDto, UpdateColorPaletteDto, ColorPaletteValidationDto } from './types';
import { Public } from '../common/decorators';

@ApiTags('Color Palettes')
@Controller('color-palettes')
@Public() // Público para el landing page
export class ColorPaletteController {
  constructor(private readonly colorPaletteService: ColorPaletteService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new color palette',
    description: 'Create a new color palette for a brand'
  })
  @ApiBody({
    type: CreateColorPaletteDto,
    description: 'Color palette data',
    examples: {
      example1: {
        summary: 'Purple Elegant Palette',
        value: {
          primary: '#8B5CF6',
          secondary: '#EC4899',
          accent: '#F59E0B',
          neutral: '#10B981',
          success: '#3B82F6',
          brandId: 1
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Color palette created successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid color format or validation error'
  })
  @ApiResponse({
    status: 404,
    description: 'Brand not found'
  })
  @ApiResponse({
    status: 409,
    description: 'Brand already has a color palette'
  })
  async createColorPalette(@Body() createDto: CreateColorPaletteDto): Promise<BaseResponseDto> {
    return this.colorPaletteService.createColorPalette(createDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get color palette by ID',
    description: 'Retrieve a color palette by its ID'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Color palette ID', 
    example: 1 
  })
  @ApiResponse({
    status: 200,
    description: 'Color palette retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Color palette not found'
  })
  async getColorPalette(@Param('id', ParseIntPipe) id: number): Promise<BaseResponseDto> {
    return this.colorPaletteService.getColorPaletteById(id);
  }

  @Get('brand/:brandId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get color palette by brand ID',
    description: 'Retrieve a color palette by brand ID'
  })
  @ApiParam({ 
    name: 'brandId', 
    description: 'Brand ID', 
    example: 1 
  })
  @ApiResponse({
    status: 200,
    description: 'Color palette retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Color palette not found for this brand'
  })
  async getColorPaletteByBrand(@Param('brandId', ParseIntPipe) brandId: number): Promise<BaseResponseDto> {
    return this.colorPaletteService.getColorPaletteByBrandId(brandId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update color palette',
    description: 'Update an existing color palette'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Color palette ID', 
    example: 1 
  })
  @ApiBody({
    type: UpdateColorPaletteDto,
    description: 'Updated color palette data',
    examples: {
      example1: {
        summary: 'Update primary color',
        value: {
          primary: '#FF5733'
        }
      },
      example2: {
        summary: 'Update multiple colors',
        value: {
          primary: '#FF5733',
          secondary: '#33FF57',
          accent: '#3357FF'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Color palette updated successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid color format or validation error'
  })
  @ApiResponse({
    status: 404,
    description: 'Color palette not found'
  })
  async updateColorPalette(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateColorPaletteDto
  ): Promise<BaseResponseDto> {
    return this.colorPaletteService.updateColorPalette(id, updateDto);
  }

  @Put('brand/:brandId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update color palette by brand ID',
    description: 'Update a color palette by brand ID'
  })
  @ApiParam({ 
    name: 'brandId', 
    description: 'Brand ID', 
    example: 1 
  })
  @ApiBody({
    type: UpdateColorPaletteDto,
    description: 'Updated color palette data'
  })
  @ApiResponse({
    status: 200,
    description: 'Color palette updated successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid color format or validation error'
  })
  @ApiResponse({
    status: 404,
    description: 'Color palette not found for this brand'
  })
  async updateColorPaletteByBrand(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Body() updateDto: UpdateColorPaletteDto
  ): Promise<BaseResponseDto> {
    return this.colorPaletteService.updateColorPaletteByBrandId(brandId, updateDto);
  }

  @Post('brand/:brandId/upsert')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create or update color palette',
    description: 'Create a new color palette or update existing one for a brand (upsert operation)'
  })
  @ApiParam({ 
    name: 'brandId', 
    description: 'Brand ID', 
    example: 1 
  })
  @ApiBody({
    description: 'Color palette data without brandId',
    examples: {
      example1: {
        summary: 'Blue Professional Palette',
        value: {
          primary: '#3B82F6',
          secondary: '#06B6D4',
          accent: '#10B981',
          neutral: '#8B5CF6',
          success: '#F59E0B'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Color palette created or updated successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid color format or validation error'
  })
  @ApiResponse({
    status: 404,
    description: 'Brand not found'
  })
  async upsertColorPalette(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Body() paletteData: Omit<CreateColorPaletteDto, 'brandId'>
  ): Promise<BaseResponseDto> {
    return this.colorPaletteService.upsertColorPalette(brandId, paletteData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete color palette',
    description: 'Delete a color palette by ID'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Color palette ID', 
    example: 1 
  })
  @ApiResponse({
    status: 200,
    description: 'Color palette deleted successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Color palette not found'
  })
  async deleteColorPalette(@Param('id', ParseIntPipe) id: number): Promise<BaseResponseDto> {
    return this.colorPaletteService.deleteColorPalette(id);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate color palette',
    description: 'Validate color palette format without saving to database'
  })
  @ApiBody({
    type: ColorPaletteValidationDto,
    description: 'Color palette data to validate',
    examples: {
      validExample: {
        summary: 'Valid color palette',
        value: {
          primary: '#8B5CF6',
          secondary: '#EC4899',
          accent: '#F59E0B',
          neutral: '#10B981',
          success: '#3B82F6'
        }
      },
      invalidExample: {
        summary: 'Invalid color palette',
        value: {
          primary: 'not-a-color',
          secondary: '#EC4899',
          accent: '#F59E0B',
          neutral: '#10B981',
          success: '#3B82F6'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Validation result returned'
  })
  async validateColorPalette(@Body() palette: ColorPaletteValidationDto): Promise<BaseResponseDto> {
    return this.colorPaletteService.validateColorPaletteColors(palette);
  }
}