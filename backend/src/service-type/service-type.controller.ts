// src/service-type/service-type.controller.ts
import { Controller, Get, Param, Request } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ServiceTypeService } from './service-type.service';

@ApiTags('Service Types')
@ApiBearerAuth()
@Controller('brand/:brandId/service-types')
export class ServiceTypeController {
  constructor(private readonly serviceTypeService: ServiceTypeService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener tipos de servicios',
    description: 'Retorna los tipos de servicios disponibles para el brand',
  })
  @ApiParam({ name: 'brandId', description: 'ID del brand', example: 456 })
  @ApiResponse({
    status: 200,
    description: 'Tipos de servicios obtenidos exitosamente',
    type: Object,
  })
  async getServiceTypes(
    @Param('brandId') brandId: string,
    @Request() req: any, // 👈 Agregar esto para acceder al usuario (aunque no lo uses)
  ) {
    const serviceTypes = await this.serviceTypeService.getServiceTypesByBrand(
      parseInt(brandId),
    );
    return { data: serviceTypes };
  }
}
