import { ApiProperty } from '@nestjs/swagger';

export class EmailValidationResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica si el email está disponible para registro'
  })
  isAvailable: boolean;

  @ApiProperty({
    example: 'pablo@gmail.com',
    description: 'El email que se validó'
  })
  email: string;
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
