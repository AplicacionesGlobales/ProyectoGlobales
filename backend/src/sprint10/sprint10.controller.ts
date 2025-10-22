// src/sprint10/sprint10.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
  Res,
  Header,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../common/decorators';
import { Sprint10Service } from './sprint10.service';
import { BaseResponseDto } from '../common/dto';
import {
  BillingCalculationRequestDto,
  BillingCalculationResponseDto,
  ManualRenewalRequestDto,
  ManualRenewalResponseDto,
  SalesReportRequestDto,
} from './dto';

@ApiTags('Sprint 10')
@Controller('api')
export class Sprint10Controller {
  constructor(private readonly sprint10Service: Sprint10Service) { }

  /**
   * Endpoint para descargar recibo en formato PDF (Pablo)
   */
  @Public()
  @Get('receipts/:id')
  @ApiOperation({
    summary: 'Descargar recibo en PDF (Pablo)',
    description:
      'Desarrollar endpoint que permita descargar recibo generado en formato PDF',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del payment para generar el recibo',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Recibo generado exitosamente',
    headers: {
      'Content-Type': {
        description: 'Tipo de contenido',
        schema: { type: 'string', example: 'application/pdf' },
      },
      'Content-Disposition': {
        description: 'Disposición del contenido',
        schema: {
          type: 'string',
          example: 'attachment; filename="recibo-1.pdf"',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Payment no encontrado',
  })
  @Header('Content-Type', 'application/pdf')
  async downloadReceipt(
    @Param('id', ParseIntPipe) paymentId: number,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const pdfBuffer =
        await this.sprint10Service.generateReceiptPDF(paymentId);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="recibo-${paymentId}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      });

      res.send(pdfBuffer);
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  /**
   * Endpoint para calcular prorateo de facturación (Pablo)
   */
  @Public()
  @Post('billing/calculate')
  @ApiOperation({
    summary: 'Calcular prorateo de facturación (Pablo)',
    description:
      'Crear servicio completo de facturación con cálculos, prorateos y renovaciones - Cálculo de prorateo por tiempo',
  })
  @ApiBody({ type: BillingCalculationRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Cálculo completado exitosamente',
    type: BaseResponseDto<BillingCalculationResponseDto>,
  })
  @ApiResponse({
    status: 404,
    description: 'Brand o Plan no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  async calculateBilling(
    @Body(ValidationPipe) request: BillingCalculationRequestDto,
  ): Promise<BaseResponseDto<BillingCalculationResponseDto>> {
    return this.sprint10Service.calculateProration(request);
  }

  /**
   * Endpoint para procesar renovación manual (Pablo)
   */
  @Public()
  @Post('billing/manual-renewal')
  @ApiOperation({
    summary: 'Procesar renovación manual (Yuli)',
    description:
      'Crear servicio completo de facturación con cálculos, prorateos y renovaciones - Gestión manual de renovaciones',
  })
  @ApiBody({ type: ManualRenewalRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Renovación procesada exitosamente',
    type: BaseResponseDto<ManualRenewalResponseDto>,
  })
  @ApiResponse({
    status: 404,
    description: 'Brand o Plan no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  async processManualRenewal(
    @Body(ValidationPipe) request: ManualRenewalRequestDto,
  ): Promise<BaseResponseDto<ManualRenewalResponseDto>> {
    return this.sprint10Service.processManualRenewal(request);
  }

  /**
   * Endpoint de debug para ver datos de la BD (Pablo)
   */
  @Public()
  @Get('debug/brand/:brandId')
  @ApiOperation({
    summary: 'Debug: Ver datos del brand (Pablo)',
    description:
      'Endpoint de debug para ver planes y datos asociados a un brand',
  })
  @ApiParam({
    name: 'brandId',
    description: 'ID del brand a consultar',
    type: 'number',
    example: 1,
  })
  async debugBrandData(@Param('brandId', ParseIntPipe) brandId: number) {
    const brand = await this.sprint10Service.debugBrandData(brandId);
    return {
      success: true,
      data: brand,
    };
  }

  /**
   * Endpoint para cambiar plan de suscripción (Pablo)
   */
  @Public()
  @Post('billing/change-plan')
  @ApiOperation({
    summary: 'Cambiar plan de suscripción (Pablo)',
    description: 'Cambiar el plan actual de un brand por uno nuevo',
  })
  @ApiBody({
    type: 'object',
    schema: {
      properties: {
        brandId: { type: 'number', example: 1 },
        newPlanId: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Plan cambiado exitosamente',
  })
  async changePlan(
    @Body(ValidationPipe) body: { brandId: number; newPlanId: number },
  ): Promise<BaseResponseDto<any>> {
    return this.sprint10Service.changePlan(body.brandId, body.newPlanId);
  }

  /**
   * Endpoint para descargar reporte de ventas en Excel (Kristel)
   * C#: Crear endpoint GET /api/reports/:id/download para descargar
   */
  @Public()
  @Get('reports/:id_brand/download')
  @ApiOperation({
    summary: 'Descargar reporte de citas y ventas en Excel (Kristel)',
    description: `Genera un reporte detallado en formato Excel con información de:
    
**DATOS PRINCIPALES (Citas):**
- ID de la cita, fecha, cliente (nombre, email, teléfono)
- Servicio contratado y duración
- Estado de la cita (Completada, Confirmada, En Progreso, Pendiente, Cancelada, No Asistió)
- Precio del servicio

**DATOS SECUNDARIOS (Pagos):**
- Información de pagos relacionados
- Estado del pago y referencia TiloPay

**PERÍODOS DISPONIBLES:**
- **weekly**: Reporte de los últimos 7 días
- **monthly**: Reporte de los últimos 30 días
- **all**: Reporte histórico completo

**RESÚMENES INCLUIDOS:**
- Total de citas por estado
- Tasa de completitud
- Ingresos por citas completadas
- Ingresos por suscripciones
- Ingresos totales`,
  })
  @ApiParam({
    name: 'id_brand',
    description: 'ID de la marca para generar el reporte',
    type: 'number',
    example: 1,
  })
  @ApiQuery({
    name: 'period',
    description:
      'Período del reporte: weekly (última semana), monthly (último mes) o all (todo el histórico)',
    enum: ['weekly', 'monthly', 'all'],
    required: true,
    example: 'monthly',
  })
  @ApiResponse({
    status: 200,
    description:
      'Reporte generado exitosamente. Se descarga un archivo Excel (.xlsx)',
    headers: {
      'Content-Type': {
        description: 'Tipo de contenido',
        schema: {
          type: 'string',
          example:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      },
      'Content-Disposition': {
        description: 'Disposición del contenido',
        schema: {
          type: 'string',
          example: 'attachment; filename="reporte-ventas-1-monthly.xlsx"',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Brand no encontrado',
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos de entrada inválidos. Verifique que el período sea: weekly, monthly o all',
  })
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async downloadSalesReport(
    @Param('id_brand', ParseIntPipe) id_brand: number,
    @Query('period') period: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const request: SalesReportRequestDto = {
        id_brand,
        period: period as any,
      };
      const excelBuffer =
        await this.sprint10Service.generateSalesReport(request);

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="reporte-ventas-${id_brand}-${period}.xlsx"`,
        'Content-Length': excelBuffer.length.toString(),
      });

      res.send(excelBuffer);
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }

  /**
   * Endpoint para generar reporte de ventas en formato JSON (Kristel)
   * A#: Crear endpoint POST /api/reports/sales para generar reportes
   */
  @Public()
  @Post('reports/sales')
  @ApiOperation({
    summary: 'Generar reporte de citas y ventas en JSON (Kristel)',
    description: `Genera un reporte detallado en formato JSON con información de:
    
**DATOS PRINCIPALES (Citas):**
- ID de la cita, fecha, cliente (nombre, email, teléfono)
- Servicio contratado y duración
- Estado de la cita (Completada, Confirmada, En Progreso, Pendiente, Cancelada, No Asistió)
- Precio del servicio

**DATOS SECUNDARIOS (Pagos):**
- Información de pagos relacionados
- Estado del pago y referencia TiloPay

**PERÍODOS DISPONIBLES:**
- **weekly**: Reporte de los últimos 7 días
- **monthly**: Reporte de los últimos 30 días
- **all**: Reporte histórico completo

**RESÚMENES INCLUIDOS:**
- Total de citas por estado
- Tasa de completitud
- Ingresos por citas completadas
- Ingresos por suscripciones
- Ingresos totales`,
  })
  @ApiBody({
    type: SalesReportRequestDto,
    description: 'Datos para generar el reporte',
    examples: {
      semanal: {
        summary: 'Reporte Semanal',
        description: 'Genera reporte de la última semana',
        value: {
          id_brand: 1,
          period: 'weekly',
        },
      },
      mensual: {
        summary: 'Reporte Mensual',
        description: 'Genera reporte del último mes',
        value: {
          id_brand: 1,
          period: 'monthly',
        },
      },
      historico: {
        summary: 'Reporte Histórico',
        description: 'Genera reporte de todo el histórico',
        value: {
          id_brand: 1,
          period: 'all',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte generado exitosamente en formato JSON',
  })
  @ApiResponse({
    status: 404,
    description: 'Brand no encontrado',
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos de entrada inválidos. Verifique que el período sea: weekly, monthly o all',
  })
  async generateSalesReportJson(
    @Body(ValidationPipe) request: SalesReportRequestDto,
  ): Promise<BaseResponseDto<any>> {
    return this.sprint10Service.generateSalesReportJson(request);
  }
}
