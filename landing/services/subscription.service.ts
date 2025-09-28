// services/subscription.service.ts
import { apiClient, ApiResponse } from '../api';
import { API_ENDPOINTS } from '../api/constants';

export interface ActiveFeature {
  id: number;
  key: string;
  title: string;
  description: string;
  category: string;
  price: number;
  isActive: boolean;
  activatedAt: string;
  expiresAt?: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  type: string;
  billingPeriod: string;
  nextBillingDate: string;
  basePrice: number;
}

export interface PricingBreakdown {
  featureName: string;
  featureKey: string;
  price: number;
  billingPeriod: string;
}

export interface CostBreakdown {
  planBase: number;
  features: number;
  discounts: number;
  taxes: number;
  total: number;
}

export interface CostSummary {
  currency: string;
  breakdown: CostBreakdown;
  nextBillingAmount: number;
  nextBillingDate: string;
}

export interface SubscriptionLimits {
  maxUsers?: number;
  maxAppointments?: number;
  maxBranches?: number;
  storageGB?: number;
}

export interface SubscriptionFeatures {
  brandId: number;
  brandName: string;
  subscriptionStatus: 'active' | 'inactive' | 'suspended';
  plan?: SubscriptionPlan;
  activeFeatures: ActiveFeature[];
  featuresByCategory: Record<string, ActiveFeature[]>;
  totalFeatures: number;
  pricingBreakdown: PricingBreakdown[];
  subtotalFeatures: number;
  basePlanPrice: number;
  totalMonthlyPrice: number;
  costSummary: CostSummary;
  monthlyFeaturesPrice: number;
  limits: SubscriptionLimits;
}

export interface UpgradePlanRequest {
  planId: number;
  billingPeriod: 'monthly' | 'annual';
}

export interface CancelSubscriptionRequest {
  reason?: string;
  feedback?: string;
}

class SubscriptionService {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Obtener las funcionalidades activas de mi suscripción
  async getMySubscriptionFeatures(): Promise<ApiResponse<SubscriptionFeatures>> {
    try {
      const response = await apiClient.get<SubscriptionFeatures>(
        API_ENDPOINTS.SUBSCRIPTION.FEATURES,
        { headers: this.getAuthHeaders() }
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        errors: [
          {
            code: 'SUBSCRIPTION_FEATURES_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo las funcionalidades de la suscripción'
          }
        ]
      };
    }
  }

  // Obtener planes disponibles para upgrade
  async getAvailablePlans(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get<any[]>(
        API_ENDPOINTS.SUBSCRIPTION.AVAILABLE_PLANS,
        { headers: this.getAuthHeaders() }
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        errors: [
          {
            code: 'AVAILABLE_PLANS_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo los planes disponibles'
          }
        ]
      };
    }
  }

  // Actualizar plan de suscripción
  async upgradePlan(data: UpgradePlanRequest): Promise<ApiResponse<SubscriptionFeatures>> {
    try {
      const response = await apiClient.post<SubscriptionFeatures>(
        API_ENDPOINTS.SUBSCRIPTION.UPGRADE,
        data,
        { headers: this.getAuthHeaders() }
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        errors: [
          {
            code: 'UPGRADE_PLAN_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error actualizando el plan de suscripción'
          }
        ]
      };
    }
  }

  // Cancelar suscripción
  async cancelSubscription(data?: CancelSubscriptionRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.post<{ message: string }>(
        API_ENDPOINTS.SUBSCRIPTION.CANCEL,
        data || {},
        { headers: this.getAuthHeaders() }
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        errors: [
          {
            code: 'CANCEL_SUBSCRIPTION_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error cancelando la suscripción'
          }
        ]
      };
    }
  }

  // Obtener historial de pagos
  async getPaymentHistory(page: number = 1, limit: number = 10): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<any>(
        API_ENDPOINTS.SUBSCRIPTION.PAYMENT_HISTORY,
        { 
          headers: this.getAuthHeaders()
        }
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        errors: [
          {
            code: 'PAYMENT_HISTORY_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error obteniendo el historial de pagos'
          }
        ]
      };
    }
  }

  // Actualizar método de pago
  async updatePaymentMethod(paymentMethodId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.put<{ message: string }>(
        API_ENDPOINTS.SUBSCRIPTION.PAYMENT_METHOD,
        { paymentMethodId },
        { headers: this.getAuthHeaders() }
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        errors: [
          {
            code: 'UPDATE_PAYMENT_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error actualizando el método de pago'
          }
        ]
      };
    }
  }

  // Reactivar suscripción cancelada
  async reactivateSubscription(): Promise<ApiResponse<SubscriptionFeatures>> {
    try {
      const response = await apiClient.post<SubscriptionFeatures>(
        API_ENDPOINTS.SUBSCRIPTION.REACTIVATE,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        errors: [
          {
            code: 'REACTIVATE_SUBSCRIPTION_ERROR',
            description: error?.response?.data?.errors?.[0]?.description || 
                        error?.message || 
                        'Error reactivando la suscripción'
          }
        ]
      };
    }
  }
}

export const subscriptionService = new SubscriptionService();