import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ColorPaletteCreationData } from '../interfaces/brand-registration.interface';

@Injectable()
export class ColorPaletteService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida que los colores hexadecimales tengan el formato correcto
   * @param colorPalette Paleta de colores a validar
   * @returns boolean true si todos los colores son válidos
   */
  validateHexColors(colorPalette: Omit<ColorPaletteCreationData, 'brandId'>): boolean {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    
    const colors = [
      colorPalette.primary,
      colorPalette.secondary,
      colorPalette.accent,
      colorPalette.neutral,
      colorPalette.success
    ];

    return colors.every(color => hexColorRegex.test(color));
  }

  /**
   * Normaliza los colores hexadecimales a formato uppercase
   * @param colorPalette Paleta de colores a normalizar
   * @returns Paleta de colores normalizada
   */
  normalizeColors(colorPalette: Omit<ColorPaletteCreationData, 'brandId'>): Omit<ColorPaletteCreationData, 'brandId'> {
    return {
      primary: colorPalette.primary.toUpperCase(),
      secondary: colorPalette.secondary.toUpperCase(),
      accent: colorPalette.accent.toUpperCase(),
      neutral: colorPalette.neutral.toUpperCase(),
      success: colorPalette.success.toUpperCase()
    };
  }

  /**
   * Crea una nueva paleta de colores para una marca
   * @param colorPaletteData Datos de la paleta de colores
   * @returns Promise con la paleta de colores creada
   */
  async createColorPalette(colorPaletteData: ColorPaletteCreationData) {
    const normalizedColors = this.normalizeColors(colorPaletteData);

    return this.prisma.colorPalette.create({
      data: {
        ...normalizedColors,
        brandId: colorPaletteData.brandId
      },
      select: {
        id: true,
        primary: true,
        secondary: true,
        accent: true,
        neutral: true,
        success: true,
        brandId: true,
        createdAt: true
      }
    });
  }

  /**
   * Actualiza la paleta de colores de una marca existente
   * @param brandId ID de la marca
   * @param colorPaletteData Nuevos datos de la paleta
   * @returns Promise con la paleta actualizada
   */
  async updateColorPalette(
    brandId: number, 
    colorPaletteData: Omit<ColorPaletteCreationData, 'brandId'>
  ) {
    const normalizedColors = this.normalizeColors(colorPaletteData);

    return this.prisma.colorPalette.upsert({
      where: { brandId },
      update: normalizedColors,
      create: {
        ...normalizedColors,
        brandId
      },
      select: {
        id: true,
        primary: true,
        secondary: true,
        accent: true,
        neutral: true,
        success: true,
        brandId: true,
        updatedAt: true
      }
    });
  }

  /**
   * Obtiene la paleta de colores de una marca
   * @param brandId ID de la marca
   * @returns Promise con la paleta de colores o null si no existe
   */
  async getColorPaletteByBrand(brandId: number) {
    return this.prisma.colorPalette.findUnique({
      where: { brandId },
      select: {
        id: true,
        primary: true,
        secondary: true,
        accent: true,
        neutral: true,
        success: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * Genera una paleta de colores predeterminada basada en un color primario
   * @param primaryColor Color primario en formato hex
   * @returns Paleta de colores generada
   */
  generateDefaultPalette(primaryColor: string): Omit<ColorPaletteCreationData, 'brandId'> {
    // Esta es una implementación básica, se podría mejorar con lógica de color más sofisticada
    return {
      primary: primaryColor.toUpperCase(),
      secondary: '#6B7280', // Gris neutro por defecto
      accent: '#F59E0B', // Ámbar por defecto
      neutral: '#9CA3AF', // Gris más claro
      success: '#10B981' // Verde por defecto
    };
  }
}
