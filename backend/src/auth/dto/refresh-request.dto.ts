import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshRequestDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'Token de renovación para obtener nuevo access token'
    })
    @IsString({ message: 'Refresh token debe ser texto' })
    @IsNotEmpty({ message: 'Refresh token es requerido' })
    refreshToken: string;
}
