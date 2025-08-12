import { ApiProperty } from '@nestjs/swagger';

export class RefreshResponseDto {
    @ApiProperty({
        description: 'Nuevo token JWT de acceso (8 horas)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    accessToken: string;

    @ApiProperty({
        description: 'Nuevo token de renovación indefinido',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    refreshToken: string;

    @ApiProperty({
        description: 'Información básica del usuario',
        example: {
            id: 1,
            email: 'admin@test.com',
            username: 'admin',
            role: 'ADMIN'
        }
    })
    user: {
        id: number;
        email: string;
        username: string;
        role: string;
    };

    @ApiProperty({
        description: 'Timestamp de cuando fue renovado',
        example: '2025-08-11T15:30:00.000Z'
    })
    renewedAt: string;
}
