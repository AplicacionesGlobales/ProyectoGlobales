import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';

export class LoginRequestDto {
    @ApiProperty({
        example: 'admin@test.com',
        description: 'Email del usuario'
    })
    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty({ message: 'Email es requerido' })
    email: string;

    @ApiProperty({
        example: 'admin123',
        description: 'Contraseña del usuario'
    })
    @IsString({ message: 'Contraseña debe ser texto' })
    @IsNotEmpty({ message: 'Contraseña es requerida' })
    password: string;

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
