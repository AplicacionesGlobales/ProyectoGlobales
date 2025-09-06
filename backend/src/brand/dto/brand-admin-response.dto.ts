import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentSettingsDto, ServiceTypeResponseDto } from './service-type.dto';

export class BrandUserDto {
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

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  lastLogin?: string;
}

export class BrandFeatureDto {
  @ApiProperty({ example: 236 })
  id: number;

  @ApiProperty({ example: 'citas' })
  key: string;

  @ApiProperty({ example: 'Sistema de Citas' })
  title: string;

  @ApiProperty({ example: 'Sistema completo de reservas con tipos de citas personalizables' })
  description: string;

  @ApiProperty({ example: 20 })
  price: number;

  @ApiProperty({ example: 'ESSENTIAL' })
  category: string;

  @ApiProperty({ example: true })
  isRecommended: boolean;

  @ApiProperty({ example: true })
  isPopular: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  activatedAt: string;
}

export class BrandPlanDto {
  @ApiProperty({ example: 456 })
  id: number;

  @ApiProperty({ example: 103 })
  planId: number;

  @ApiProperty({ example: 'complete' })
  planType: string;

  @ApiProperty({ example: 'Plan Completo' })
  planName: string;

  @ApiProperty({ example: 'Web + App móvil nativa' })
  planDescription: string;

  @ApiProperty({ example: 99 })
  basePrice: number;

  @ApiProperty({ example: 167 })
  currentPrice: number;

  @ApiProperty({ example: 'monthly' })
  billingPeriod: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  startDate: string;

  @ApiPropertyOptional({ example: '2025-01-15T10:30:00Z' })
  endDate?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: '2024-02-15T10:30:00Z' })
  nextBillingDate?: string;
}

export class BrandColorPaletteDto {
  @ApiProperty({ example: 789 })
  id: number;

  @ApiProperty({ example: '#1E3A8A' })
  primary: string;

  @ApiProperty({ example: '#3B82F6' })
  secondary: string;

  @ApiProperty({ example: '#60A5FA' })
  accent: string;

  @ApiProperty({ example: '#93C5FD' })
  neutral: string;

  @ApiProperty({ example: '#DBEAFE' })
  success: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: string;
}

export class BrandPaymentDto {
  @ApiProperty({ example: 111 })
  id: number;

  @ApiProperty({ example: 167.50 })
  amount: number;

  @ApiProperty({ example: 'CRC' })
  currency: string;

  @ApiProperty({ example: 'completed' })
  status: string;

  @ApiPropertyOptional({ example: 'credit_card' })
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'TILO123456789' })
  tilopayReference?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: string;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z' })
  processedAt?: string;
}

export class BrandStatsDto {
  @ApiProperty({ example: 5 })
  totalUsers: number;

  @ApiProperty({ example: 8 })
  totalFeatures: number;

  @ApiProperty({ example: 3 })
  activeFeatures: number;

  @ApiProperty({ example: 1250.75 })
  totalRevenue: number;

  @ApiProperty({ example: 167.50 })
  monthlyRevenue: number;

  @ApiProperty({ example: 30 })
  daysUntilNextBilling: number;

  @ApiProperty({ example: true })
  isSubscriptionActive: boolean;

  @ApiProperty({ example: 4, description: 'Total de tipos de servicio configurados' })
  totalServiceTypes: number;

  @ApiProperty({ example: 3, description: 'Tipos de servicio activos' })
  activeServiceTypes: number;

  @ApiProperty({ example: 150, description: 'Total de citas registradas' })
  totalAppointments: number;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  lastActivity: string;
}

export class BrandBusinessTypeDto {
  @ApiProperty({ example: 18 })
  id: number;

  @ApiProperty({ example: 'camarografo' })
  key: string;

  @ApiProperty({ example: 'Camarógrafo' })
  title: string;

  @ApiProperty({ example: 'Video Profesional' })
  subtitle: string;

  @ApiProperty({ example: 'Servicios de videografía profesional, eventos, comerciales y documentales' })
  description: string;

  @ApiProperty({ example: 'Video' })
  icon: string;
}

export class BrandAdminResponseDto {
  @ApiProperty({ example: 456 })
  id: number;

  @ApiProperty({ example: 'Mi Empresa Profesional' })
  name: string;

  @ApiPropertyOptional({ example: 'Servicios de fotografía y video profesional' })
  description?: string;

  @ApiPropertyOptional({ example: 'Calle 123, Ciudad' })
  address?: string;

  @ApiPropertyOptional({ example: '+506 8888-8888' })
  phone?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: string;

  @ApiProperty({ type: BrandBusinessTypeDto })
  businessType: BrandBusinessTypeDto;

  @ApiProperty({ type: [BrandUserDto] })
  users: BrandUserDto[];

  @ApiProperty({ type: [BrandFeatureDto] })
  features: BrandFeatureDto[];

  @ApiProperty({ type: BrandPlanDto })
  currentPlan: BrandPlanDto;

  @ApiProperty({ type: BrandColorPaletteDto })
  colorPalette: BrandColorPaletteDto;

  @ApiPropertyOptional({ 
    type: AppointmentSettingsDto,
    description: 'Configuración de citas del brand',
    example: {
      id: 1,
      brandId: 456,
      useServiceTypes: true,
      defaultDuration: 30,
      bufferTime: 5,
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 2,
      allowSameDayBooking: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    }
  })
  appointmentSettings?: AppointmentSettingsDto;

  @ApiPropertyOptional({ 
    type: [ServiceTypeResponseDto],
    description: 'Tipos de servicio configurados para el brand',
    example: [
      {
        id: 1,
        brandId: 456,
        name: 'Corte de Cabello',
        description: 'Corte clásico para caballeros',
        duration: 30,
        price: 15000,
        color: '#3B82F6',
        icon: 'scissors',
        isActive: true,
        order: 0,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        appointmentCount: 25,
        hasFutureAppointments: true
      },
      {
        id: 2,
        brandId: 456,
        name: 'Barba',
        description: 'Arreglo profesional de barba',
        duration: 15,
        price: 8000,
        color: '#10B981',
        icon: 'razor',
        isActive: true,
        order: 1,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        appointmentCount: 15,
        hasFutureAppointments: false
      }
    ]
  })
  serviceTypes?: ServiceTypeResponseDto[];

  @ApiProperty({ type: [BrandPaymentDto] })
  recentPayments: BrandPaymentDto[];

  @ApiProperty({ type: BrandStatsDto })
  stats: BrandStatsDto;
}