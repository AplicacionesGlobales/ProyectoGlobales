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
      
      // Los parámetros que envía nuestro backend incluyen:
      // - order_id: ID de la orden
      // - status: estado del pago (completed, failed, error)
      // - transaction_id: ID de transacción de Tilopay
      // - error_code y error_message para errores
      
      const orderId = queryParams.get('order_id');
      const status = queryParams.get('status');
      const transactionId = queryParams.get('transaction_id');
      const errorCode = queryParams.get('error_code');
      const errorMessage = queryParams.get('error_message');
      
      console.log('📋 Callback parameters:', { 
        orderId, 
        status, 
        transactionId, 
        errorCode, 
        errorMessage 
      });
      
      if (!status) {
        return {
          success: false,
          status: 'failed',
          message: 'Parámetros de callback inválidos - sin estado'
        };
      }
      
      // Manejar diferentes estados
      switch (status) {
        case 'completed':
          return {
            success: true,
            status: 'completed',
            message: '¡Pago completado exitosamente! Tu plan ha sido activado.',
            orderNumber: orderId || undefined
          };
          
        case 'failed':
          return {
            success: false,
            status: 'failed',
            message: errorMessage || 'El pago no pudo ser procesado. Por favor, inténtalo de nuevo.',
            orderNumber: orderId || undefined
          };
          
        case 'error':
          return {
            success: false,
            status: 'failed',
            message: errorMessage || 'Ocurrió un error procesando el pago.',
            orderNumber: orderId || undefined
          };
          
        default:
          return {
            success: false,
            status: 'failed',
            message: 'Estado de pago desconocido',
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