import { IsArray, IsEnum, IsOptional, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';

export enum ImportFormat {
  CSV = 'csv',
  JSON = 'json'
}

export class ImportClientsDto {
  @ApiProperty({ 
    type: [CreateClientDto],
    example: [
      {
        email: 'cliente1@ejemplo.com',
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '+50688887777'
      },
      {
        email: 'cliente2@ejemplo.com',
        firstName: 'María',
        lastName: 'González',
        phone: '+50688889999'
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClientDto)
  clients: CreateClientDto[];

  @ApiPropertyOptional({ enum: ImportFormat, example: ImportFormat.JSON })
  @IsEnum(ImportFormat)
  @IsOptional()
  format?: ImportFormat;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  skipDuplicates?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  sendWelcomeEmail?: boolean;
}

export class ImportResultDto {
  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 8 })
  imported: number;

  @ApiProperty({ example: 2 })
  skipped: number;

  @ApiProperty({ example: 0 })
  failed: number;

  @ApiPropertyOptional({ 
    example: ['cliente1@ejemplo.com ya existe', 'Formato inválido en línea 5']
  })
  errors?: string[];
}

export class ImportClientsResponseDto {
  @ApiProperty({ type: ImportResultDto })
  result: ImportResultDto;

  @ApiProperty({ example: 'Importación completada' })
  message: string;
}