// src/auth/dto/profile-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../generated/prisma';

export class ProfileResponseDto {
  @ApiProperty({ description: 'ID del usuario' })
  id: number;

  @ApiProperty({ description: 'Email del usuario' })
  email: string;

  @ApiProperty({ description: 'Username del usuario' })
  username: string;

  @ApiProperty({ description: 'Nombre del usuario' })
  firstName: string;

  @ApiProperty({ description: 'Apellido del usuario', required: false })
  lastName?: string;

  @ApiProperty({ description: 'Teléfono del usuario', required: false })
  phone?: string;

  @ApiProperty({ description: 'Rol del usuario', enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;
}