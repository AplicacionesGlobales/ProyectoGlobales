// services/payment.service.ts
import { apiClient } from '../api';
import { API_ENDPOINTS } from '../api/constants';
import type { ApiResponse } from '../api/types';

export interface PaymentRequest {
  name: string;
  email: string;
  phone: string;
  ownerName: string;
  location?: string;
  planType: string;
  billingCycle: string;
  selectedServices?: string[];
}

export interface PaymentResponse {
  paymentUrl: string;
  orderNumber: string;
  amount: number;
}

export interface PaymentStatusResponse {
  id: number;
  status: string;
  amount: number;
  currency: string;
  tilopayTransactionId?: string;
  tilopayReference: string;
  processedAt?: string;
  brand: {
    id: number;
    name: string;
  };
  plan?: {
    id: number;
    name: string;
  };
}

class PaymentService {
  async createPayment(paymentData: PaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      console.log('💳 PaymentService: Creating payment with data:', paymentData);

      const response = await apiClient.post<PaymentResponse>(
        API_ENDPOINTS.PAYMENT.CREATE,
        paymentData
      );

      console.log('✅ PaymentService: Payment creation response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ PaymentService: Payment creation error:', error);
      return {
        success: false,
        errors: [{
          code: 'PAYMENT_CREATION_ERROR',
          description: error?.message || 'Error al crear el pago'
        }]
      };
    }
  }

  /**
   * Verifica y guarda el pago consultando Tilopay API
   */
  async verifyPayment(orderNumber: string, returnData?: string): Promise<ApiResponse<PaymentStatusResponse>> {
    try {
      console.log('🔍 Verificando pago en Tilopay:', orderNumber);

      const response = await apiClient.post<PaymentStatusResponse>(
        `/payments/verify/${orderNumber}`,
        { returnData } // Enviar returnData en el body
      );

      console.log('✅ Pago verificado:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Error verificando pago:', error);
      return {
        success: false,
        errors: [{
          code: 'PAYMENT_VERIFICATION_ERROR',
          description: error?.message || 'Error al verificar el pago'
        }]
      };
    }
  }

  /**
   * Obtiene un pago existente de la base de datos (más rápido)
   */
  async getPaymentByOrder(orderNumber: string): Promise<ApiResponse<PaymentStatusResponse>> {
    try {
      const response = await apiClient.get<PaymentStatusResponse>(
        `/payments/order/${orderNumber}`
      );

      return response;
    } catch (error: any) {
      return {
        success: false,
        errors: [{
          code: 'PAYMENT_NOT_FOUND',
          description: error?.message || 'Pago no encontrado'
        }]
      };
    }
  }

  /**
   * Procesa el callback de Tilopay
   */
  async handlePaymentCallback(queryParams: URLSearchParams): Promise<{
    success: boolean;
    status: 'completed' | 'failed' | 'pending';
    message: string;
    orderNumber?: string;
    paymentData?: PaymentStatusResponse;
  }> {
    try {
      const code = queryParams.get('code');
      const orderNumber = queryParams.get('order');
      const description = queryParams.get('description');
      const returnData = queryParams.get('returnData'); // 🔥 OBTENER returnData

      console.log('📞 Processing callback:', { code, orderNumber, returnData });

      if (!orderNumber) {
        return {
          success: false,
          status: 'failed',
          message: 'Número de orden inválido'
        };
      }

      // Si el código no es 1, el pago falló
      if (code !== '1') {
        return {
          success: false,
          status: 'failed',
          message: this.getErrorMessage(code, description),
          orderNumber
        };
      }

      // Verificar y guardar el pago con returnData
      const verifyResponse = await this.verifyPayment(orderNumber, returnData || undefined);

      if (verifyResponse.success && verifyResponse.data) {
        return {
          success: true,
          status: 'completed',
          message: '¡Pago completado exitosamente!',
          orderNumber,
          paymentData: verifyResponse.data
        };
      }

      // Si falla la verificación, intentar obtener de DB
      const dbResponse = await this.getPaymentByOrder(orderNumber);

      if (dbResponse.success && dbResponse.data) {
        return {
          success: true,
          status: 'completed',
          message: 'Pago encontrado en registros',
          orderNumber,
          paymentData: dbResponse.data
        };
      }

      return {
        success: false,
        status: 'failed',
        message: 'No se pudo verificar el pago. Contacta a soporte.',
        orderNumber
      };

    } catch (error: any) {
      console.error('❌ Error en callback:', error);
      return {
        success: false,
        status: 'failed',
        message: 'Error procesando el callback'
      };
    }
  }

  private getErrorMessage(code: string | null, description: string | null): string {
    if (!code) return description || 'Error desconocido';

    const errorMessages: Record<string, string> = {
      '0': 'Pago cancelado',
      '5': 'Transacción no autorizada',
      '12': 'Datos de tarjeta incorrectos',
      '41': 'Tarjeta bloqueada o perdida',
      '43': 'Tarjeta rechazada',
      '51': 'Fondos insuficientes',
      '54': 'Tarjeta expirada',
      '82': 'CVV incorrecto',
    };

    return errorMessages[code] || description || 'Error procesando el pago';
  }
}

export const paymentService = new PaymentService();