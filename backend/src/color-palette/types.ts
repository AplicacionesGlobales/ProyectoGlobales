// Export DTOs from the dto file
export * from './dto/color-palette.dto';

// Interface for internal use (matches Prisma model)
export interface ColorPaletteDto {
  id: number;
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  success: string;
  brandId: number;
  createdAt: Date;
  updatedAt: Date;
}