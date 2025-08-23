import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExistingClientDto {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ example: 'cliente@ejemplo.com' })
  email: string;

  @ApiProperty({ example: 'Juan' })
  firstName: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  lastName?: string;
}

export class CheckEmailResponseDto {
  @ApiProperty({ example: true })
  available: boolean;

  @ApiProperty({ example: 'Email disponible' })
  message: string;

  @ApiPropertyOptional({ type: ExistingClientDto })
  existingClient?: ExistingClientDto;
}
