// Types para Request y Response de cada endpoint

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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

