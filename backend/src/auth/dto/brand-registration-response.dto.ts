import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ example: 'usuario@ejemplo.com' })
  email: string;

  @ApiProperty({ example: 'usuario_abc123' })
  username: string;

  @ApiProperty({ example: 'Juan' })
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  lastName: string;

  @ApiProperty({ example: 'ROOT' })
  role: string;
}

export class BrandResponseDto {
  @ApiProperty({ example: 456 })
  id: number;

  @ApiProperty({ example: 'Mi Empresa' })
  name: string;

  @ApiPropertyOptional({ example: 'Descripción del servicio' })
  description?: string;

  @ApiPropertyOptional({ example: '+506 8888-8888' })
  phone?: string;

  @ApiPropertyOptional({ example: 'fotografo' })
  businessType?: string;

  @ApiPropertyOptional({ example: ['citas', 'ubicaciones', 'archivos', 'pagos'] })
  features?: string[];

  @ApiPropertyOptional({ example: 'https://storage.com/logos/456.jpg' })
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://storage.com/logos/456_isotopo.jpg' })
  isotopoUrl?: string;

  @ApiPropertyOptional({ example: 'https://storage.com/logos/456_imagotipo.jpg' })
  imagotipoUrl?: string;
}

export class ColorPaletteResponseDto {
  @ApiProperty({ example: 789 })
  id: number;

  @ApiProperty({ example: '#1a73e8' })
  primary: string;

  @ApiProperty({ example: '#34a853' })
  secondary: string;

  @ApiProperty({ example: '#fbbc04' })
  accent: string;

  @ApiProperty({ example: '#9aa0a6' })
  neutral: string;

  @ApiProperty({ example: '#137333' })
  success: string;

  @ApiPropertyOptional({ example: ['#8B5CF6', '#EC4899', '#F59E0B'] })
  customColors?: string[];
}

export class PlanResponseDto {
  @ApiProperty({ example: 321 })
  id: number;

  @ApiProperty({ example: 'web' })
  type: string;

  @ApiProperty({ example: 0 })
  price: number;

  @ApiProperty({ example: ['Citas ilimitadas', 'Soporte básico'] })
  features: string[];

  @ApiProperty({ example: 'monthly' })
  billingPeriod: string;
}

export class PaymentResponseDto {
  @ApiProperty({ example: 'completed' })
  status: string;

  @ApiPropertyOptional({ example: 'TILO123456789' })
  tilopayReference?: string;

  @ApiProperty({ example: '2025-08-10T21:30:00.000Z' })
  processedAt?: string;
}

export class BrandRegistrationResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: BrandResponseDto })
  brand: BrandResponseDto;

  @ApiProperty({ type: ColorPaletteResponseDto })
  colorPalette: ColorPaletteResponseDto;

  @ApiProperty({ type: PlanResponseDto })
  plan: PlanResponseDto;

  @ApiPropertyOptional({ type: PaymentResponseDto })
  payment?: PaymentResponseDto;

  @ApiProperty({ example: 'jwt.token.here' })
  token: string;
}

// Mantener compatibilidad con el DTO anterior
export class BrandRegistrationResponse {
  @ApiProperty({ description: 'ID único de la marca creada', example: 1 })
  brandId: number;

  @ApiProperty({ description: 'ID único del usuario ROOT creado', example: 1 })
  userId: number;

  @ApiProperty({ description: 'ID único de la paleta de colores', example: 1 })
  colorPaletteId: number;

  @ApiProperty({ description: 'Nombre de la marca', example: 'Mi Fotografía Profesional' })
  brandName: string;

  @ApiProperty({ description: 'Username del usuario creado', example: 'owner_business' })
  username: string;

  @ApiProperty({ description: 'Email del usuario creado', example: 'owner@business.com' })
  email: string;

  @ApiProperty({ description: 'Token JWT para autenticación inmediata', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ description: 'Timestamp de creación', example: '2025-08-10T22:00:00Z' })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Mensaje de confirmación',
    example: 'Marca y usuario ROOT creados exitosamente. Tu aplicación estará ready en 10 días hábiles.'
  })
  message: string;
}
