// Base Response Types (para match con backend)
export interface ErrorDetail {
  code: number;
  description?: string;
  field?: string;
  message?: string;
}

export interface BaseResponseDto<T = any> {
  success: boolean;  // Cambio de 'successful' a 'success'
  data?: T;
  errors?: ErrorDetail[];  // Cambio de 'error' a 'errors'
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
  branchId: number; // ID de la marca para clientes
}

export interface RegisterResponse extends BaseResponseDto<LoginData> {
  // RegisterResponse usa la misma estructura que LoginData
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginData {
  token: string;
  user: {
    id: number;  // Cambiar de string a number para coincidir con backend
    email: string;
    username: string;
    firstName?: string;  // Optional para coincidir con backend
    lastName?: string;   // Optional para coincidir con backend
    role: string;
  };
  brand?: {  // Agregar brand que viene del backend
    id: number;
    name: string;
  };
  refreshToken?: string;
  rememberMe?: boolean;
}

export interface LoginResponse extends BaseResponseDto<LoginData> {
}

export interface ValidateEmailRequest {
  email: string;
  brandId?: number;
}

export interface ValidateEmailData {
  isAvailable: boolean;
}

export interface ValidateEmailResponse extends BaseResponseDto<ValidateEmailData> {
}

export interface ValidateUsernameRequest {
  username: string;
}

export interface ValidateUsernameData {
  isAvailable: boolean;
}

export interface ValidateUsernameResponse extends BaseResponseDto<ValidateUsernameData> {
}

// Forgot Password Types
export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

// Wrapped response from backend
export interface ForgotPasswordApiResponse extends BaseResponseDto<ForgotPasswordResponse> { }

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
export interface ValidateResetCodeApiResponse extends BaseResponseDto<ValidateResetCodeResponse> { }

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
export interface ResetPasswordApiResponse extends BaseResponseDto<ResetPasswordResponse> { }


export interface ColorPaletteData {
  id: number;
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  success: string;
  brandId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ColorPaletteResponse extends BaseResponseDto<ColorPaletteData> {
}

// NEW: Brand Configuration Types
export interface BrandData {
  id: number;
  name: string;
  appName?: string;
  companyName?: string;
  logo?: {
    url: string;
    width: number;
    height: number;
  };
}

export interface BrandResponse extends BaseResponseDto<BrandData> {
}

// NEW: App Configuration (combinación de marca y colores)
export interface AppConfigData {
  brandId: number;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    success: string;
  };
  branding: {
    appName: string;
    companyName: string;
    primaryColor: string;
  };
  logo?: {
    uri: string;
    width: number;
    height: number;
  };
}