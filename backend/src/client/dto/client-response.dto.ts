// client/dto/client-response.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClientResponseDto {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ example: 'cliente@ejemplo.com' })
  email: string;

  @ApiProperty({ example: 'Juan' })
  firstName: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  lastName?: string | null;  // 🔧 Corregido: solo un punto y coma

  @ApiPropertyOptional({ example: '+50688887777' })  // 🔧 Cambiado a Optional
  phone?: string;  // 🔧 Hecho opcional con ?

  @ApiPropertyOptional({ example: 'Cliente preferencial' })
  notes?: string | null;  // 🔧 Corregido: solo un punto y coma

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 456 })
  brandId: number;

  @ApiProperty({ example: 15 })
  totalAppointments: number;

  @ApiPropertyOptional({ example: '2024-08-20T10:00:00Z' })
  lastVisit?: Date | null;  // 🔧 Corregido: solo un punto y coma

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-08-20T10:30:00Z' })
  updatedAt: Date;
}