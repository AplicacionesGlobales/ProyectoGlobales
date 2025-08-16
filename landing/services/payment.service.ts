// services/payment.service.ts
import { apiClient, ApiResponse } from '../api';
import { API_ENDPOINTS } from '../api/constants';

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

class PaymentService {
  async createPayment(paymentData: PaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      const response = await apiClient.post<PaymentResponse>(
        API_ENDPOINTS.PAYMENT.CREATE,
        paymentData
      );
      return response;
    } catch (error: any) {
      console.error('Payment creation error:', error);
      return {
        success: false,
        errors: [{
          code: 'PAYMENT_CREATION_ERROR',
          description: error?.message || 'Error al crear el pago'
        }]
      };
    }
  }

  async getPaymentStatus(orderNumber: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<any>(
        API_ENDPOINTS.PAYMENT.GET_BY_ORDER(orderNumber)
      );
      return response;
    } catch (error: any) {
      console.error('Payment status error:', error);
      return {
        success: false,
        errors: [{
          code: 'PAYMENT_STATUS_ERROR',
          description: error?.message || 'Error al verificar estado del pago'
        }]
      };
    }
  }
}

export const paymentService = new PaymentService();