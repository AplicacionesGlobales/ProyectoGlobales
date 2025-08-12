import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ValidateUsernameDto {
  @ApiProperty({
    example: 'pablo123',
    description: 'Username a validar'
  })
  @IsString({ message: 'El username debe ser un texto' })
  username: string;
}

export class UsernameValidationResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica si el username está disponible para registro'
  })
  isAvailable: boolean;

  @ApiProperty({
    example: 'pablo123',
    description: 'El username que se validó'
  })
  username: string;
}
