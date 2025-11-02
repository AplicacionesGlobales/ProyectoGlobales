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

export interface BrandImageData {
  id: number;
  name: string;
  url: string;
  key: string;
  contentType: string;
  fileType: string; // 'logo', 'isotipo', 'imagotipo'
  size: number;
  entityId: number;
  entityType: string;
  uploadedBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Estructura como viene directamente del backend (sin envoltorio)
export interface BrandImagesData {
  logo?: BrandImageData;
  isotipo?: BrandImageData;
  imagotipo?: BrandImageData;
}

// Si en algún momento tu API cambia para devolver con envoltorio, usa esta:
export interface BrandImagesResponse {
  success: boolean;
  data?: BrandImagesData;
  message?: string;
  error?: string;
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

export interface ServiceType {
  id: number;
  brandId: number;
  name: string;
  description: string | null;
  duration: number;
  price: number | null;
  color: string | null;
  icon: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceTypesResponse {
  data: ServiceType[];
}

export interface CreateAppointmentRequest {
  startTime: string; 
  serviceTypeId?: number;
  notes?: string;
}

export interface CreateAppointmentResponse {
  success: boolean;
  data: {
    id: number;
    brandId: number;
    clientId: number;
    serviceTypeId: number;
    serviceType: {
      id: number;
      name: string;
      description: string | null;
      duration: number;
      color: string;
      icon: string | null;
    };
    startTime: string; 
    endTime: string;  
    duration: number;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | string;
    notes?: string;
    createdBy: number;
    createdAt: string;
    updatedAt: string;
    client: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    creator: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  message?: string;
  errors?: Array<{ description: string }>;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  date: string;
}

export interface AvailableTimeSlotsResponse {
  success: boolean;
  data: TimeSlot[];
  message?: string;
}

export interface AppointmentFormData {
  selectedDate: Date | null;
  selectedTime: string | null;
  notes: string;
  serviceTypeId: number | null;
}

// New types for appointment by date endpoints
export interface AppointmentsByDateResponse {
  success: boolean;
  data: any[];
}

export interface AppointmentsByDateRangeResponse {
  success: boolean;
  data: {
    appointments: any[];
    total: number;
    pages: number;
  };
}

// Client Dashboard Types
export interface ClientProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProfileResponse extends BaseResponseDto<ClientProfile> {}

export interface ClientAppointmentDto {
  id: number;
  startTime: string;
  endTime: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  price?: number;
  serviceType: {
    id: number;
    name: string;
    price: number;
  };
  professional?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ClientAppointmentSummary {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
}

export interface ClientAppointmentPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClientAppointmentsListResponse {
  appointments: ClientAppointmentDto[];
  pagination: ClientAppointmentPagination;
  summary: ClientAppointmentSummary;
}

export interface ClientAppointmentsResponse extends BaseResponseDto<ClientAppointmentsListResponse> {}

// Dashboard request types
export interface GetClientAppointmentsQuery {
  startDate?: string;
  endDate?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  period?: 'upcoming' | 'past' | 'today' | 'all';
  page?: number;
  limit?: number;
}

