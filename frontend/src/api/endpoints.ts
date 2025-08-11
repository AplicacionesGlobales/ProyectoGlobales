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
  BaseResponseDto
} from './types';

// Función helper para hacer requests
const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
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

// Health Endpoints
export const healthCheck = async (): Promise<HealthResponse> => {
  const response = await apiRequest<HealthResponse>(
    API_ENDPOINTS.HEALTH,
    'GET'
  );
  
  console.log('Health check response:', response.status);
  return response;
};

// Auth Endpoints
export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  return apiRequest<RegisterResponse>(
    API_ENDPOINTS.AUTH.REGISTER,
    'POST',
    data
  );
};

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  return apiRequest<LoginResponse>(
    API_ENDPOINTS.AUTH.LOGIN,
    'POST',
    data
  );
};

export const validateEmail = async (email: string, brandId?: number): Promise<ValidateEmailResponse> => {
  return apiRequest<ValidateEmailResponse>(
    API_ENDPOINTS.AUTH.VALIDATE_EMAIL,
    'POST',
    { email, brandId }
  );
};

export const validateUsername = async (username: string): Promise<ValidateUsernameResponse> => {
  return apiRequest<ValidateUsernameResponse>(
    API_ENDPOINTS.AUTH.VALIDATE_USERNAME,
    'POST',
    { username }
  );
};

export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  const apiResponse = await apiRequest<BaseResponseDto<ForgotPasswordResponse>>(
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
    'POST',
    { email }
  );
  
  // Extraer la data del wrapper BaseResponseDto
  if (apiResponse.successful && apiResponse.data) {
    return apiResponse.data;
  } else {
    // Si hay error, lanzar excepción con el mensaje
    const errorMessage = apiResponse.error?.[0]?.description || 'Error al enviar código de recuperación';
    throw new Error(errorMessage);
  }
};

// Nuevos endpoints para reset password
export const validateResetCode = async (data: ValidateResetCodeRequest): Promise<ValidateResetCodeResponse> => {
  const apiResponse = await apiRequest<BaseResponseDto<ValidateResetCodeResponse>>(
    API_ENDPOINTS.AUTH.VALIDATE_RESET_CODE,
    'POST',
    data
  );
  
  // Extraer la data del wrapper BaseResponseDto
  if (apiResponse.successful && apiResponse.data) {
    return apiResponse.data;
  } else {
    // Si hay error, lanzar excepción con el mensaje
    const errorMessage = apiResponse.error?.[0]?.description || 'Error al validar código';
    throw new Error(errorMessage);
  }
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  const apiResponse = await apiRequest<BaseResponseDto<ResetPasswordResponse>>(
    API_ENDPOINTS.AUTH.RESET_PASSWORD,
    'POST',
    data
  );
  
  // Extraer la data del wrapper BaseResponseDto
  if (apiResponse.successful && apiResponse.data) {
    return apiResponse.data;
  } else {
    // Si hay error, lanzar excepción con el mensaje
    const errorMessage = apiResponse.error?.[0]?.description || 'Error al restablecer contraseña';
    throw new Error(errorMessage);
  }
};