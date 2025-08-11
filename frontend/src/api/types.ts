// Base Response Types (para match con backend)
export interface ErrorDetail {
  code: number;
  description?: string;
  field?: string;
  message?: string;
}

export interface BaseResponseDto<T = any> {
  successful: boolean;
  data?: T;
  error?: ErrorDetail[];
}

// Health Endpoint
export interface HealthRequest {
  // No tiene parámetros de request
}

export interface HealthResponse {
  status: string;
}

// Auth Endpoints
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface ValidateEmailRequest {
  email: string;
}

export interface ValidateEmailResponse {
  available: boolean;
  message?: string;
}

export interface ValidateUsernameRequest {
  username: string;
}

export interface ValidateUsernameResponse {
  available: boolean;
  message?: string;
}

// Forgot Password Types
export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

// Wrapped response from backend
export interface ForgotPasswordApiResponse extends BaseResponseDto<ForgotPasswordResponse> {}

// Validate Reset Code Types
export interface ValidateResetCodeRequest {
  code: string;
  email: string;
}

export interface ValidateResetCodeResponse {
  valid: boolean;
  message: string;
  userId?: number;
  email?: string;
}

// Wrapped response from backend
export interface ValidateResetCodeApiResponse extends BaseResponseDto<ValidateResetCodeResponse> {}

// Reset Password Types
export interface ResetPasswordRequest {
  code: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  errors?: { [key: string]: string[] };
}

// Wrapped response from backend
export interface ResetPasswordApiResponse extends BaseResponseDto<ResetPasswordResponse> {}
