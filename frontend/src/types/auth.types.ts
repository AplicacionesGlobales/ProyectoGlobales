export interface RegisterFormData {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean; // Nuevo campo para "recordar sesión"
}

export interface RegisterResponse {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
  brand?: {
    id: number;
    name: string;
  };
  token: string;
  refreshToken?: string; // Nuevo: token de renovación indefinido
  rememberMe: boolean;   // Nuevo: indica si la sesión es persistente
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    username: string;
    role: string;
  };
  renewedAt: string;
}

export interface AuthError {
  message: string;
  field?: string;
  code?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface EmailValidationResponse {
  isAvailable: boolean;
  email: string;
}

export interface UsernameValidationResponse {
  isAvailable: boolean;
  username: string;
}

// Nuevos tipos para el sistema de sesiones
export interface SessionState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthResponse['user'] | null;
  brand: AuthResponse['brand'] | null;
  rememberMe: boolean;
  lastActivity: number;
}

export interface TokenRefreshResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}