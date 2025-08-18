import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BrandRegistrationResponseDto {
  @ApiProperty({
    description: 'User information',
    example: {
      id: 1,
      email: 'usuario@ejemplo.com',
      username: 'usuario_abc123',
      firstName: 'Juan',
      lastName: 'Pérez',
      role: 'ROOT'
    }
  })
  user: {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
  };

  @ApiProperty({
    description: 'Brand information',
    example: {
      id: 1,
      name: 'Mi Empresa',
      description: 'Descripción del servicio',
      phone: '+506 8888-8888',
      businessType: 'restaurant',
      features: ['online_orders', 'reservations'],
      logoUrl: '/uploads/brands/1/logo_1692123456789.png',
      isotipoUrl: '/uploads/brands/1/isotipo_1692123456789.png',
      imagotipoUrl: '/uploads/brands/1/imagotipo_1692123456789.png'
    }
  })
  brand: {
    id: number;
    name: string;
    description?: string;
    phone?: string;
    businessType?: string;
    features?: string[];
    logoUrl?: string;
    isotipoUrl?: string;
    imagotipoUrl?: string;
  };

  @ApiProperty({
    description: 'Color palette information',
    example: {
      id: 1,
      primary: '#1a73e8',
      secondary: '#34a853',
      accent: '#fbbc04',
      neutral: '#9aa0a6',
      success: '#137333'
    }
  })
  colorPalette: {
    id: number;
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    success: string;
  };

  @ApiProperty({
    description: 'Plan information',
    example: {
      id: 1,
      type: 'complete',
      price: 167,
      features: ['Gestión de pedidos online', 'Sistema de reservas', 'Panel analítico'],
      billingPeriod: 'monthly'
    }
  })
  plan: {
    id: number;
    type: string;
    price: number;
    features: string[];
    billingPeriod: string;
  };

  @ApiPropertyOptional({
    description: 'Payment information (if applicable)',
    example: {
      status: 'completed',
      tilopayReference: 'TPAY_123456789',
      processedAt: '2025-08-15T10:30:00.000Z'
    }
  })
  payment?: {
    status: string;
    tilopayReference?: string;
    processedAt?: string;
  };

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  token: string;
}