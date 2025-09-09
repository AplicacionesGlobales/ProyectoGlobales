import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class GoogleValidateDto {
    @ApiProperty({
        example: 'eyJhbGciOiJSUzI1NiIs...',
        description: 'Google ID Token obtenido del SDK'
    })
    @IsString({ message: 'ID Token debe ser texto' })
    @IsNotEmpty({ message: 'ID Token es requerido' })
    idToken: string;

    @ApiProperty({
        example: 1,
        description: 'ID de la marca donde se registra el usuario'
    })
    @IsInt({ message: 'Brand ID debe ser un número' })
    @IsNotEmpty({ message: 'Brand ID es requerido' })
    brandId: number;

    @ApiProperty({
        example: false,
        description: 'Si debe recordar la sesión indefinidamente',
        required: false,
        default: false
    })
    @IsOptional()
    @IsBoolean({ message: 'RememberMe debe ser verdadero o falso' })
    rememberMe?: boolean = false;
}
