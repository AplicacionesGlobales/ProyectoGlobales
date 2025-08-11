import { ApiProperty } from '@nestjs/swagger';

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
    example: 'Marca y usuario ROOT creados exitosamente. Tu aplicación estará lista en 10 días hábiles.'
  })
  message: string;
}
