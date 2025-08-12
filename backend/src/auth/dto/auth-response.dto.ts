import { ApiProperty } from '@nestjs/swagger';

export class AuthResponse {
  @ApiProperty({
    description: 'Información del usuario autenticado',
    example: {
      id: 1,
      email: 'admin@test.com',
      username: 'admin',
      firstName: 'John',
      lastName: 'Doe',
      role: 'ADMIN'
    }
  })
  user: {
    id: number;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };

  @ApiProperty({
    description: 'Información de la marca (opcional)',
    example: {
      id: 1,
      name: 'Mi Negocio'
    },
    required: false
  })
  brand?: {
    id: number;
    name: string;
  };

  @ApiProperty({
    description: 'Token JWT de acceso (8 horas)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  token: string;

  @ApiProperty({
    description: 'Token de renovación indefinido (solo si rememberMe: true)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false
  })
  refreshToken?: string;

  @ApiProperty({
    description: 'Indica si la sesión será recordada indefinidamente',
    example: false
  })
  rememberMe: boolean;
}
