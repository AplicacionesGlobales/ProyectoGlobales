import { API_BASE_URL, API_ENDPOINTS, HTTP_STATUS, REQUEST_TIMEOUT, PLAN_PRICING } from './constants';
import {
  ApiResponse,
  CreateBrandRequest,
  BrandRegistrationResponse,
  CreatePaymentRequest,
  PaymentResponse,
  LoginRequest,
  AuthResponse,
  HealthResponse,
  PlanType,
  BillingCycle,
} from './types';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          errors: data.errors || [{
            code: response.status,
            description: data.message || 'Error en la solicitud'
          }]
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            errors: [{
              code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
              description: 'Tiempo de espera agotado'
            }]
          };
        }
      }

      return {
        success: false,
        errors: [{
          code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          description: 'Error de conexión'
        }]
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<HealthResponse>> {
    return this.request<HealthResponse>(API_ENDPOINTS.HEALTH);
  }

  // Brand registration
  async registerBrand(brandData: CreateBrandRequest): Promise<ApiResponse<BrandRegistrationResponse>> {
    return this.request<BrandRegistrationResponse>(
      API_ENDPOINTS.AUTH.REGISTER_BRAND,
      {
        method: 'POST',
        body: JSON.stringify(brandData),
      }
    );
  }

  // Login
  async loginAdmin(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN_ADMIN,
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
  }

  async loginClient(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN_CLIENT,
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
  }

  // Payment
  async createPayment(paymentData: CreatePaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    return this.request<PaymentResponse>(
      API_ENDPOINTS.PAYMENT.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(paymentData),
      }
    );
  }

  // Price calculation utilities
  calculatePrice(
    planType: PlanType,
    billingCycle: BillingCycle,
    selectedServices: string[] = []
  ): number {
    if (planType === PlanType.WEB) {
      return 0; // Plan web gratuito
    }

    // Precio base
    const basePrice = PLAN_PRICING.BASE[planType] || 0;

    // Precio de servicios
    const servicesPrice = selectedServices.reduce((total, serviceId) => {
      return total + (PLAN_PRICING.SERVICES[serviceId as keyof typeof PLAN_PRICING.SERVICES] || 0);
    }, 0);

    const monthlyTotal = basePrice + servicesPrice;

    // Si es anual, multiplicar por 12
    return billingCycle === BillingCycle.ANNUAL ? monthlyTotal * PLAN_PRICING.ANNUAL_MULTIPLIER : monthlyTotal;
  }

  getPlanDisplayPrice(
    planType: PlanType,
    billingCycle: BillingCycle,
    selectedServices: string[] = []
  ): { monthly: number; annual: number; display: number } {
    const monthly = this.calculatePrice(planType, BillingCycle.MONTHLY, selectedServices);
    const annual = this.calculatePrice(planType, BillingCycle.ANNUAL, selectedServices);
    const display = billingCycle === BillingCycle.ANNUAL ? annual : monthly;

    return { monthly, annual, display };
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export individual functions for convenience
export const {
  healthCheck,
  registerBrand,
  loginAdmin,
  loginClient,
  createPayment,
  calculatePrice,
  getPlanDisplayPrice,
} = apiClient;
