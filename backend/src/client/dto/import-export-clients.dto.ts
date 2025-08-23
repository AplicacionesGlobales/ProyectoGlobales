// client/dto/import-export-clients.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';

// ==================== IMPORTACIÓN ====================

export class ImportClientDataDto {
  @ApiProperty({ example: 'cliente@ejemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  firstName: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+50688887777' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Cliente preferencial, le gusta el servicio premium' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ImportClientsDto {
  @ApiProperty({ 
    type: [ImportClientDataDto],
    description: 'Lista de clientes a importar'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportClientDataDto)
  clients: ImportClientDataDto[];
}

export class ImportErrorDto {
  @ApiProperty({ example: 'cliente@ejemplo.com' })
  email: string;

  @ApiPropertyOptional({ 
    example: 'Email ya existe en este negocio',
    description: 'Mensaje de error simple'
  })
  error?: string;

  @ApiPropertyOptional({ 
    type: 'array',
    description: 'Lista de errores detallados',
    example: [
      {
        code: 'EMAIL_EXISTS_IN_BRANCH',
        description: 'El email ya está registrado en este negocio'
      }
    ]
  })
  errors?: any[];
}

export class ImportClientsResponseDto {
  @ApiProperty({ 
    example: 50,
    description: 'Total de clientes procesados'
  })
  total: number;

  @ApiProperty({ 
    example: 45,
    description: 'Clientes importados exitosamente'
  })
  successful: number;

  @ApiProperty({ 
    example: 5,
    description: 'Clientes que fallaron al importar'
  })
  failed: number;

  @ApiProperty({ 
    type: [ImportErrorDto],
    description: 'Detalles de los errores de importación'
  })
  errors: ImportErrorDto[];
}

// ==================== EXPORTACIÓN ====================

export class ExportClientDto {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ example: 'cliente@ejemplo.com' })
  email: string;

  @ApiProperty({ example: 'Juan' })
  firstName: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  lastName?: string;

  @ApiPropertyOptional({ example: '+50688887777' })
  phone?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-08-20T14:45:00Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ example: 15 })
  totalAppointments?: number;

  @ApiPropertyOptional({ example: 1250.00 })
  totalRevenue?: number;

  @ApiPropertyOptional({ example: '2024-08-15T10:00:00Z' })
  lastVisit?: Date;
}

export class ExportClientsJsonResponseDto {
  @ApiProperty({ 
    type: [ExportClientDto],
    description: 'Lista de clientes exportados'
  })
  clients: ExportClientDto[];

  @ApiProperty({ 
    example: 50,
    description: 'Total de clientes exportados'
  })
  total: number;

  @ApiProperty({ 
    example: 'json',
    description: 'Formato de exportación'
  })
  format: string;

  @ApiProperty({ 
    example: '2024-08-22T10:00:00Z',
    description: 'Fecha de exportación'
  })
  exportedAt: Date;
}

export class ExportClientsCsvResponseDto {
  @ApiProperty({ 
    example: 'id,email,firstName,lastName,phone,isActive,createdAt,updatedAt,totalAppointments,totalRevenue,lastVisit\n123,cliente@ejemplo.com,Juan,Pérez,+50688887777,true,2024-01-15T10:30:00Z,2024-08-20T14:45:00Z,15,1250.00,2024-08-15T10:00:00Z',
    description: 'Contenido CSV'
  })
  csv: string;

  @ApiProperty({ 
    example: 50,
    description: 'Total de clientes exportados'
  })
  total: number;

  @ApiProperty({ 
    example: 'csv',
    description: 'Formato de exportación'
  })
  format: string;

  @ApiProperty({ 
    example: 'clients_export_20240822.csv',
    description: 'Nombre sugerido para el archivo'
  })
  filename: string;
}