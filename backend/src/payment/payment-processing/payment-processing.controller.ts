// backend/src/payment/payment-processing/payment-processing.controller.ts
import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  ParseIntPipe, 
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Res,
  Header
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { PaymentProcessingService } from './payment-processing.service';
import { ReceiptGeneratorService } from './receipt-generator.service';
import { GenerateReceiptDto } from './dto/generate-receipt.dto';
import { BaseResponseDto } from '../../common/dto';
import { Public } from '../../common/decorators';

@ApiTags('Procesamiento de Pagos')
@Controller('payments')
export class PaymentProcessingController {
  constructor(
    private readonly paymentProcessingService: PaymentProcessingService,
    private readonly receiptGeneratorService: ReceiptGeneratorService
  ) {}

  @Post('verify/:orderNumber')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar y guardar pago desde Tilopay' })
  @ApiParam({ name: 'orderNumber', description: 'Número de orden del pago', type: String })
  @ApiResponse({ status: 200, description: 'Pago verificado y guardado exitosamente' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado en Tilopay' })
  async verifyPayment(
    @Param('orderNumber') orderNumber: string,
    @Body() body?: { returnData?: string }
  ): Promise<BaseResponseDto<any>> {
    try {
      const result = await this.paymentProcessingService.verifyAndSavePayment(
        orderNumber,
        body?.returnData
      );
      return BaseResponseDto.success(result);
    } catch (error) {
      console.error('💥 Error verificando pago:', error);
      return BaseResponseDto.error([{
        code: 5001,
        description: error.message || 'Error verificando pago'
      }]);
    }
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Obtener estado de un pago por ID' })
  @ApiParam({ name: 'id', description: 'ID del pago', type: Number })
  @ApiResponse({ status: 200, description: 'Estado del pago obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  async getPaymentStatus(
    @Param('id', ParseIntPipe) id: number
  ): Promise<BaseResponseDto<any>> {
    try {
      const paymentStatus = await this.paymentProcessingService.getPaymentStatus(id);
      return BaseResponseDto.success(paymentStatus);
    } catch (error) {
      console.error('💥 Error getting payment status:', error);
      return BaseResponseDto.error([{
        code: 5002,
        description: error.message || 'Error obteniendo estado del pago'
      }]);
    }
  }

  @Get('order/:orderNumber')
  @Public()
  @ApiOperation({ summary: 'Obtener pago por número de orden' })
  @ApiParam({ name: 'orderNumber', description: 'Número de orden del pago', type: String })
  @ApiResponse({ status: 200, description: 'Pago obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  async getPaymentByOrder(
    @Param('orderNumber') orderNumber: string
  ): Promise<BaseResponseDto<any>> {
    try {
      const payment = await this.paymentProcessingService.getPaymentByOrderNumber(orderNumber);
      return BaseResponseDto.success(payment);
    } catch (error) {
      console.error('💥 Error getting payment by order:', error);
      return BaseResponseDto.error([{
        code: 5002,
        description: error.message || 'Error obteniendo pago'
      }]);
    }
  }

  @Post('receipts/generate')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/pdf')
  @ApiOperation({ summary: 'Generar recibo PDF para un pago' })
  @ApiResponse({ status: 200, description: 'Recibo generado exitosamente' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado o no completado' })
  async generateReceipt(
    @Body(ValidationPipe) generateReceiptDto: GenerateReceiptDto,
    @Res() res: Response
  ): Promise<void> {
    try {
      const { buffer, filename } = await this.receiptGeneratorService.generateReceipt(
        generateReceiptDto.paymentId
      );

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/pdf');
      res.send(buffer);
    } catch (error) {
      console.error('💥 Error generating receipt:', error);
      res.status(404).json(BaseResponseDto.error([{
        code: 5003,
        description: error.message || 'Error generando recibo'
      }]));
    }
  }
}