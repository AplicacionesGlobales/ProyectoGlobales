import { API_ENDPOINTS, BASE_URL } from './constants';
import {
  HealthResponse,
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ValidateEmailResponse,
  ValidateUsernameResponse,
  ForgotPasswordResponse,
  ValidateResetCodeRequest,
  ValidateResetCodeResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  BaseResponseDto,
  ColorPaletteResponse,
  BrandResponse,
  BrandImagesResponse,
  ServiceTypesResponse,
  CreateAppointmentRequest,
  CreateAppointmentResponse
} from './types';
import { secureStorage } from '../utils/secureStorage';

const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  requiresAuth: boolean = false
): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Agregar token de autorización si es requerido
  if (requiresAuth) {
    try {
      const accessToken = await secureStorage.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      } else {
        throw new Error('No access token available');
      }
    } catch (error) {
      throw new Error('Authentication required but no valid token found');
    }
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
};

// Health Endpoints (sin autenticación)
export const healthCheck = async (): Promise<HealthResponse> => {
  const response = await apiRequest<HealthResponse>(
    API_ENDPOINTS.HEALTH,
    'GET',
    undefined,
    false // No requiere autenticación
  );

  console.log('Health check response:', response.status);
  return response;
};

// Auth Endpoints (sin autenticación)
export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  return apiRequest<RegisterResponse>(
    API_ENDPOINTS.AUTH.REGISTER,
    'POST',
    data,
    false // No requiere autenticación
  );
};

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  return apiRequest<LoginResponse>(
    API_ENDPOINTS.AUTH.LOGIN,
    'POST',
    data,
    false // No requiere autenticación
  );
};

export const validateGoogleToken = async (data: {
  idToken: string;
  brandId: number;
  rememberMe?: boolean;
}): Promise<LoginResponse> => {
  return apiRequest<LoginResponse>(
    API_ENDPOINTS.AUTH.GOOGLE_VALIDATE,
    'POST',
    data,
    false // No requiere autenticación
  );
};

export const validateEmail = async (email: string, brandId?: number): Promise<ValidateEmailResponse> => {
  return apiRequest<ValidateEmailResponse>(
    API_ENDPOINTS.VALIDATE.EMAIL,
    'POST',
    { email, brandId },
    false // No requiere autenticación
  );
};

export const validateUsername = async (username: string): Promise<ValidateUsernameResponse> => {
  return apiRequest<ValidateUsernameResponse>(
    API_ENDPOINTS.VALIDATE.USERNAME,
    'POST',
    { username },
    false // No requiere autenticación
  );
};

export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  const apiResponse = await apiRequest<BaseResponseDto<ForgotPasswordResponse>>(
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
    'POST',
    { email },
    false // No requiere autenticación
  );

  // Extraer la data del wrapper BaseResponseDto
  if (apiResponse.success && apiResponse.data) {
    return apiResponse.data;
  } else {
    // Si hay error, lanzar excepción con el mensaje
    const errorMessage = apiResponse.errors?.[0]?.description || 'Error al enviar código de recuperación';
    throw new Error(errorMessage);
  }
};

// Endpoints para reset password (sin autenticación)
export const validateResetCode = async (data: ValidateResetCodeRequest): Promise<ValidateResetCodeResponse> => {
  const apiResponse = await apiRequest<BaseResponseDto<ValidateResetCodeResponse>>(
    API_ENDPOINTS.AUTH.VALIDATE_RESET_CODE,
    'POST',
    data,
    false // No requiere autenticación
  );

  // Extraer la data del wrapper BaseResponseDto
  if (apiResponse.success && apiResponse.data) {
    return apiResponse.data;
  } else {
    // Si hay error, lanzar excepción con el mensaje
    const errorMessage = apiResponse.errors?.[0]?.description || 'Error al validar código';
    throw new Error(errorMessage);
  }
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  const apiResponse = await apiRequest<BaseResponseDto<ResetPasswordResponse>>(
    API_ENDPOINTS.AUTH.RESET_PASSWORD,
    'POST',
    data,
    false // No requiere autenticación
  );

  // Extraer la data del wrapper BaseResponseDto
  if (apiResponse.success && apiResponse.data) {
    return apiResponse.data;
  } else {
    // Si hay error, lanzar excepción con el mensaje
    const errorMessage = apiResponse.errors?.[0]?.description || 'Error al restablecer contraseña';
    throw new Error(errorMessage);
  }
};

// Endpoints que requieren autenticación
export const getColorPaletteByBrand = async (brandId: number): Promise<ColorPaletteResponse> => {
  return apiRequest<ColorPaletteResponse>(
    `${API_ENDPOINTS.COLOR_PALETTES.BY_BRAND}/${brandId}`,
    'GET',
    undefined,
    false
  );
};

export const getBrandById = async (brandId: number): Promise<BrandResponse> => {
  return apiRequest<BrandResponse>(
    `${API_ENDPOINTS.BRANDS.BY_ID}/${brandId}`,
    'GET',
    undefined,
    false
  );
};

export const getBrandImages = async (brandId: number): Promise<BrandImagesResponse> => {
  return apiRequest<BrandImagesResponse>(
    `${API_ENDPOINTS.BRAND_IMAGES.BY_BRAND}/${brandId}/images`,
    'GET',
    undefined,
    false
  );
};

export const getServicesTypes = async (brandId: number): Promise<ServiceTypesResponse> => {
  return apiRequest<ServiceTypesResponse>(
    `${API_ENDPOINTS.SERVICE_TYPES.BY_ID.replace('{brandId}', brandId.toString())}/service-types`,
    'GET',
    undefined,
    true
  );
};

export const createAppointment = async (data: CreateAppointmentRequest, brandId: number): Promise<CreateAppointmentResponse> => {
  return apiRequest<CreateAppointmentResponse>(
    `${API_ENDPOINTS.APPOINTMENTS.CREATE.replace('{brandId}', brandId.toString())}/appointments`,
    'POST',
    data,
    true
  );
};