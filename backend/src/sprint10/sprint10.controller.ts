// src/sprint10/sprint10.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
  Res,
  Header
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../common/decorators';
import { Sprint10Service } from './sprint10.service';
import { BaseResponseDto } from '../common/dto';
import {
  BillingCalculationRequestDto,
  BillingCalculationResponseDto,
  ManualRenewalRequestDto,
  ManualRenewalResponseDto
} from './dto';

@ApiTags('Sprint 10')
@Controller('api')
export class Sprint10Controller {
  constructor(private readonly sprint10Service: Sprint10Service) {}

  /**
   * Endpoint para descargar recibo en formato PDF (Pablo)
   */
  @Public()
  @Get('receipts/:id')
  @ApiOperation({
    summary: 'Descargar recibo en PDF (Pablo)',
    description: 'Desarrollar endpoint que permita descargar recibo generado en formato PDF'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del payment para generar el recibo',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Recibo generado exitosamente',
    headers: {
      'Content-Type': {
        description: 'Tipo de contenido',
        schema: { type: 'string', example: 'application/pdf' }
      },
      'Content-Disposition': {
        description: 'Disposición del contenido',
        schema: { type: 'string', example: 'attachment; filename="recibo-1.pdf"' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Payment no encontrado'
  })
  @Header('Content-Type', 'application/pdf')
  async downloadReceipt(
    @Param('id', ParseIntPipe) paymentId: number,
    @Res() res: Response
  ): Promise<void> {
    try {
      const pdfBuffer = await this.sprint10Service.generateReceiptPDF(paymentId);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="recibo-${paymentId}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
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
    description: 'Crear servicio completo de facturación con cálculos, prorateos y renovaciones - Cálculo de prorateo por tiempo'
  })
  @ApiBody({ type: BillingCalculationRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Cálculo completado exitosamente',
    type: BaseResponseDto<BillingCalculationResponseDto>
  })
  @ApiResponse({
    status: 404,
    description: 'Brand o Plan no encontrado'
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos'
  })
  async calculateBilling(
    @Body(ValidationPipe) request: BillingCalculationRequestDto
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
    description: 'Crear servicio completo de facturación con cálculos, prorateos y renovaciones - Gestión manual de renovaciones'
  })
  @ApiBody({ type: ManualRenewalRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Renovación procesada exitosamente',
    type: BaseResponseDto<ManualRenewalResponseDto>
  })
  @ApiResponse({
    status: 404,
    description: 'Brand o Plan no encontrado'
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos'
  })
  async processManualRenewal(
    @Body(ValidationPipe) request: ManualRenewalRequestDto
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
    description: 'Endpoint de debug para ver planes y datos asociados a un brand'
  })
  @ApiParam({
    name: 'brandId',
    description: 'ID del brand a consultar',
    type: 'number',
    example: 1
  })
  async debugBrandData(
    @Param('brandId', ParseIntPipe) brandId: number
  ) {
    const brand = await this.sprint10Service.debugBrandData(brandId);
    return {
      success: true,
      data: brand
    };
  }
}