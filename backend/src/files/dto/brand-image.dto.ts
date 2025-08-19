import { IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileResponseDto } from './file.dto';

export enum BrandImageType {
  LOGO = 'LOGO',
  ISOTOPO = 'ISOTOPO', 
  IMAGOTIPO = 'IMAGOTIPO'
}

export class UploadBrandImageDto {
  @ApiProperty({ example: 1, description: 'ID de la marca' })
  @IsNumber()
  brandId: number;

  @ApiProperty({ enum: BrandImageType, example: BrandImageType.LOGO })
  @IsEnum(BrandImageType)
  imageType: BrandImageType;

  @ApiProperty({ example: 1, description: 'ID del usuario que sube la imagen' })
  @IsNumber()
  userId: number;
}

export class BrandImagesResponseDto {
  @ApiPropertyOptional({ type: FileResponseDto, nullable: true })
  logo: FileResponseDto | null;

  @ApiPropertyOptional({ type: FileResponseDto, nullable: true })
  isotipo: FileResponseDto | null;

  @ApiPropertyOptional({ type: FileResponseDto, nullable: true })
  imagotipo: FileResponseDto | null;
}
