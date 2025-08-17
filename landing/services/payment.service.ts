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
  status: string;
  orderNumber: string;
  amount?: number;
  processedAt?: string;
  tilopayReference?: string;
}

class PaymentService {
  async createPayment(paymentData: PaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      console.log('💳 PaymentService: Creating payment with data:', paymentData);
      
      // Validar datos antes de enviar
      if (!paymentData.name || paymentData.name.trim().length === 0) {
        throw new Error('El nombre de la marca es requerido');
      }
      if (!paymentData.email || paymentData.email.trim().length === 0) {
        throw new Error('El email es requerido');
      }
      if (!paymentData.phone || paymentData.phone.trim().length === 0) {
        throw new Error('El teléfono es requerido');
      }
      if (!paymentData.ownerName || paymentData.ownerName.trim().length === 0) {
        throw new Error('El nombre del propietario es requerido');
      }
      if (!paymentData.planType || paymentData.planType.trim().length === 0) {
        throw new Error('El tipo de plan es requerido');
      }
      if (!paymentData.billingCycle || paymentData.billingCycle.trim().length === 0) {
        throw new Error('El ciclo de facturación es requerido');
      }
      
      const response = await apiClient.post<PaymentResponse>(
        API_ENDPOINTS.PAYMENT.CREATE,
        paymentData
      );
      
      console.log('✅ PaymentService: Payment creation response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ PaymentService: Payment creation error:', error);
      
      // Si es un error de HTTP, intentar obtener más detalles
      if (error.message && error.message.includes('HTTP error')) {
        return {
          success: false,
          errors: [{
            code: 'HTTP_ERROR',
            description: `Error del servidor (${error.message}). Verifique que todos los campos estén completos.`
          }]
        };
      }
      
      return {
        success: false,
        errors: [{
          code: 'PAYMENT_CREATION_ERROR',
          description: error?.message || 'Error al crear el pago'
        }]
      };
    }
  }

  async getPaymentStatus(orderNumber: string): Promise<ApiResponse<PaymentStatusResponse>> {
    try {
      console.log('🔍 PaymentService: Getting payment status for order:', orderNumber);
      
      const response = await apiClient.get<PaymentStatusResponse>(
        API_ENDPOINTS.PAYMENT.GET_BY_ORDER(orderNumber)
      );
      
      console.log('✅ PaymentService: Payment status response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ PaymentService: Payment status error:', error);
      return {
        success: false,
        errors: [{
          code: 'PAYMENT_STATUS_ERROR',
          description: error?.message || 'Error al verificar estado del pago'
        }]
      };
    }
  }

  async handlePaymentCallback(queryParams: URLSearchParams): Promise<{
    success: boolean;
    status: 'completed' | 'failed' | 'pending';
    message: string;
    orderNumber?: string;
  }> {
    try {
      console.log('📞 PaymentService: Processing payment callback');
      console.log('🔍 All query parameters:');
      
      // Log todos los parámetros para debugging
      for (const [key, value] of queryParams.entries()) {
        console.log(`  ${key}: ${value}`);
      }
      
      // Tilopay envía directamente estos parámetros:
      // - code: '1' para éxito, otros códigos para error
      // - description: descripción del resultado
      // - order: número de orden
      // - tilopay-transaction: ID de transacción
      // - auth: código de autorización
      // - returnData: datos adicionales en base64
      
      const code = queryParams.get('code');
      const orderId = queryParams.get('order');
      const description = queryParams.get('description');
      const transactionId = queryParams.get('tilopay-transaction');
      const authCode = queryParams.get('auth');
      
      console.log('📋 Extracted Tilopay parameters:', { 
        code, 
        orderId, 
        description, 
        transactionId, 
        authCode 
      });
      
      if (!code) {
        return {
          success: false,
          status: 'failed',
          message: 'Parámetros de callback inválidos - sin código de respuesta'
        };
      }
      
      // Manejar códigos de Tilopay
      if (code === '1') {
        // Pago exitoso
        return {
          success: true,
          status: 'completed',
          message: `¡Pago completado exitosamente! ${description || 'Tu plan ha sido activado.'}`,
          orderNumber: orderId || undefined
        };
      } else {
        // Pago fallido - mapear códigos comunes de Tilopay
        let errorMessage = description || 'El pago no pudo ser procesado';
        
        switch (code) {
          case '51':
            errorMessage = 'Fondos insuficientes en tu tarjeta. Verifica tu saldo e intenta nuevamente.';
            break;
          case '82':
            errorMessage = 'Código de seguridad (CVV) inválido. Verifica los datos de tu tarjeta.';
            break;
          case '43':
            errorMessage = 'Tu tarjeta fue rechazada. Contacta a tu banco para más información.';
            break;
          case '12':
            errorMessage = 'Datos de la tarjeta incorrectos. Verifica la información e intenta nuevamente.';
            break;
          case '05':
          case '41':
            errorMessage = 'Tu tarjeta fue rechazada por el banco. Intenta con otra tarjeta.';
            break;
          case '54':
            errorMessage = 'Tu tarjeta ha expirado. Usa una tarjeta vigente.';
            break;
          case '0':
            errorMessage = 'Pago cancelado por el usuario.';
            break;
          default:
            errorMessage = description || 'Error procesando el pago. Intenta nuevamente.';
        }
        
        return {
          success: false,
          status: 'failed',
          message: errorMessage,
          orderNumber: orderId || undefined
        };
      }
      
    } catch (error: any) {
      console.error('❌ PaymentService: Callback processing error:', error);
      return {
        success: false,
        status: 'failed',
        message: 'Error al procesar el callback del pago'
      };
    }
  }
}

export const paymentService = new PaymentService();