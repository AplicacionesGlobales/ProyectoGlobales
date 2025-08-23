import { ApiProperty } from '@nestjs/swagger';
import { ClientResponseDto } from './client-response.dto';

export class PaginationDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class ClientListResponseDto {
  @ApiProperty({ type: [ClientResponseDto] })
  clients: ClientResponseDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}