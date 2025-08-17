import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseResponseDto } from '../common/dto';
import { 
  ColorPaletteDto, 
  CreateColorPaletteDto, 
  UpdateColorPaletteDto,
  ColorPaletteValidationDto 
} from './types';

@Injectable()
export class ColorPaletteService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validates if a color is a valid hex color format
   */
  private isValidHexColor(color: string): boolean {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
  }

  /**
   * Validates all colors in a palette
   */
  private validateColorPalette(palette: ColorPaletteValidationDto): string[] {
    const errors: string[] = [];
    
    if (!this.isValidHexColor(palette.primary)) {
      errors.push('Primary color must be a valid hex color (e.g., #FF5733)');
    }
    
    if (!this.isValidHexColor(palette.secondary)) {
      errors.push('Secondary color must be a valid hex color (e.g., #FF5733)');
    }
    
    if (!this.isValidHexColor(palette.accent)) {
      errors.push('Accent color must be a valid hex color (e.g., #FF5733)');
    }
    
    if (!this.isValidHexColor(palette.neutral)) {
      errors.push('Neutral color must be a valid hex color (e.g., #FF5733)');
    }
    
    if (!this.isValidHexColor(palette.success)) {
      errors.push('Success color must be a valid hex color (e.g., #FF5733)');
    }

    return errors;
  }

  /**
   * Transform Prisma ColorPalette to DTO
   */
  private transformToDto(colorPalette: any): ColorPaletteDto {
    return {
      id: colorPalette.id,
      primary: colorPalette.primary,
      secondary: colorPalette.secondary,
      accent: colorPalette.accent,
      neutral: colorPalette.neutral,
      success: colorPalette.success,
      brandId: colorPalette.brandId,
      createdAt: colorPalette.createdAt,
      updatedAt: colorPalette.updatedAt,
    };
  }

  /**
   * Create a new color palette for a brand
   */
  async createColorPalette(createDto: CreateColorPaletteDto): Promise<BaseResponseDto<ColorPaletteDto>> {
    try {
      // Validate colors
      const validationErrors = this.validateColorPalette(createDto);
      if (validationErrors.length > 0) {
        return BaseResponseDto.validationError(validationErrors);
      }

      // Check if brand exists
      const brand = await this.prisma.brand.findUnique({
        where: { id: createDto.brandId }
      });

      if (!brand) {
        return BaseResponseDto.singleError(404, `Brand with id ${createDto.brandId} not found`);
      }

      // Check if brand already has a color palette
      const existingPalette = await this.prisma.colorPalette.findUnique({
        where: { brandId: createDto.brandId }
      });

      if (existingPalette) {
        return BaseResponseDto.singleError(409, 'Brand already has a color palette. Use update instead.');
      }

      // Create color palette
      const colorPalette = await this.prisma.colorPalette.create({
        data: createDto,
      });

      return BaseResponseDto.success(this.transformToDto(colorPalette));
    } catch (error) {
      console.error('Error creating color palette:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Get color palette by brand ID
   */
  async getColorPaletteByBrandId(brandId: number): Promise<BaseResponseDto<ColorPaletteDto>> {
    try {
      const colorPalette = await this.prisma.colorPalette.findUnique({
        where: { brandId },
      });

      if (!colorPalette) {
        return BaseResponseDto.singleError(404, `Color palette for brand ${brandId} not found`);
      }

      return BaseResponseDto.success(this.transformToDto(colorPalette));
    } catch (error) {
      console.error('Error getting color palette:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Get color palette by ID
   */
  async getColorPaletteById(id: number): Promise<BaseResponseDto<ColorPaletteDto>> {
    try {
      const colorPalette = await this.prisma.colorPalette.findUnique({
        where: { id },
      });

      if (!colorPalette) {
        return BaseResponseDto.singleError(404, `Color palette with id ${id} not found`);
      }

      return BaseResponseDto.success(this.transformToDto(colorPalette));
    } catch (error) {
      console.error('Error getting color palette:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Update color palette
   */
  async updateColorPalette(id: number, updateDto: UpdateColorPaletteDto): Promise<BaseResponseDto<ColorPaletteDto>> {
    try {
      // Check if color palette exists
      const existingPalette = await this.prisma.colorPalette.findUnique({
        where: { id }
      });

      if (!existingPalette) {
        return BaseResponseDto.singleError(404, `Color palette with id ${id} not found`);
      }

      // Create validation object with existing values and new updates
      const paletteToValidate = {
        primary: updateDto.primary || existingPalette.primary,
        secondary: updateDto.secondary || existingPalette.secondary,
        accent: updateDto.accent || existingPalette.accent,
        neutral: updateDto.neutral || existingPalette.neutral,
        success: updateDto.success || existingPalette.success,
      };

      // Validate colors
      const validationErrors = this.validateColorPalette(paletteToValidate);
      if (validationErrors.length > 0) {
        return BaseResponseDto.validationError(validationErrors);
      }

      // Update color palette
      const updatedPalette = await this.prisma.colorPalette.update({
        where: { id },
        data: updateDto,
      });

      return BaseResponseDto.success(this.transformToDto(updatedPalette));
    } catch (error) {
      console.error('Error updating color palette:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Update color palette by brand ID
   */
  async updateColorPaletteByBrandId(brandId: number, updateDto: UpdateColorPaletteDto): Promise<BaseResponseDto<ColorPaletteDto>> {
    try {
      // Check if color palette exists for this brand
      const existingPalette = await this.prisma.colorPalette.findUnique({
        where: { brandId }
      });

      if (!existingPalette) {
        return BaseResponseDto.singleError(404, `Color palette for brand ${brandId} not found`);
      }

      // Use the existing update method
      return this.updateColorPalette(existingPalette.id, updateDto);
    } catch (error) {
      console.error('Error updating color palette by brand ID:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Delete color palette
   */
  async deleteColorPalette(id: number): Promise<BaseResponseDto<{ message: string }>> {
    try {
      const existingPalette = await this.prisma.colorPalette.findUnique({
        where: { id }
      });

      if (!existingPalette) {
        return BaseResponseDto.singleError(404, `Color palette with id ${id} not found`);
      }

      await this.prisma.colorPalette.delete({
        where: { id }
      });

      return BaseResponseDto.success({
        message: 'Color palette deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting color palette:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Validate color palette without saving (useful for frontend validation)
   */
  async validateColorPaletteColors(palette: ColorPaletteValidationDto): Promise<BaseResponseDto<{ isValid: boolean; errors: string[] }>> {
    try {
      const errors = this.validateColorPalette(palette);
      
      return BaseResponseDto.success({
        isValid: errors.length === 0,
        errors
      });
    } catch (error) {
      console.error('Error validating color palette:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Create or update color palette (upsert)
   */
  async upsertColorPalette(brandId: number, paletteData: Omit<CreateColorPaletteDto, 'brandId'>): Promise<BaseResponseDto<ColorPaletteDto>> {
    try {
      // Validate colors
      const validationErrors = this.validateColorPalette(paletteData);
      if (validationErrors.length > 0) {
        return BaseResponseDto.validationError(validationErrors);
      }

      // Check if brand exists
      const brand = await this.prisma.brand.findUnique({
        where: { id: brandId }
      });

      if (!brand) {
        return BaseResponseDto.singleError(404, `Brand with id ${brandId} not found`);
      }

      // Upsert color palette
      const colorPalette = await this.prisma.colorPalette.upsert({
        where: { brandId },
        update: paletteData,
        create: {
          ...paletteData,
          brandId
        },
      });

      return BaseResponseDto.success(this.transformToDto(colorPalette));
    } catch (error) {
      console.error('Error upserting color palette:', error);
      return BaseResponseDto.singleError(500, error instanceof Error ? error.message : 'Unknown error');
    }
  }
}