import {
  registerUser,
  loginUser,
  validateEmail as validateEmailEndpoint,
  validateUsername as validateUsernameEndpoint,
  forgotPassword as forgotPasswordEndpoint,
  validateResetCode as validateResetCodeEndpoint,
  resetPassword as resetPasswordEndpoint
} from '../api/endpoints';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ForgotPasswordResponse,
  ValidateResetCodeRequest,
  ValidateResetCodeResponse,
  ResetPasswordRequest,
  ResetPasswordResponse
} from '../api/types';
import { RegisterFormData, LoginFormData, AuthResponse, RefreshTokenResponse, TokenRefreshResult } from '../types/auth.types';
import { secureStorage, TokenUtils } from '../utils/secureStorage';
import Constants from 'expo-constants';

// Obtener brandId del app.json
const getBrandId = (): number => {
  return parseInt(Constants.expoConfig?.extra?.brand_id || '1');
};

export interface IAuthService {
  register(data: Omit<RegisterFormData, 'confirmPassword'>): Promise<RegisterResponse>;
  login(data: LoginFormData): Promise<AuthResponse>;
  refreshToken(): Promise<TokenRefreshResult>;
  logout(): Promise<void>;
  validateEmail(email: string): Promise<boolean>;
  validateUsername(username: string): Promise<boolean>;
  forgotPassword(email: string): Promise<ForgotPasswordResponse>;
  validateResetCode(data: ValidateResetCodeRequest): Promise<ValidateResetCodeResponse>;
  resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse>;
  // Nuevos métodos para sesiones perpetuas
  isAuthenticated(): Promise<boolean>;
  getCurrentUser(): Promise<any>;
  autoRefreshToken(): Promise<boolean>;
}

class AuthService implements IAuthService {
  private baseURL: string;
  private refreshInterval: any = null; // Usar any para compatibilidad cross-platform

  constructor(baseURL: string = process.env.API_URL || 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  /**
   * Iniciar auto-renovación de tokens cada 6 horas
   */
  private startTokenAutoRenewal(): void {
    // Limpiar intervalo anterior si existe
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Auto-renovación cada 6 horas (21600000 ms)
    this.refreshInterval = setInterval(async () => {
      const hasRefreshToken = await secureStorage.hasRefreshToken();
      if (hasRefreshToken) {
        console.log('🔄 Auto-renovación de token iniciada...');
        const result = await this.autoRefreshToken();
        if (result) {
          console.log('✅ Token auto-renovado exitosamente');
        } else {
          console.log('❌ Error en auto-renovación de token');
        }
      }
    }, 21600000); // 6 horas
  }

  /**
   * Detener auto-renovación de tokens
   */
  private stopTokenAutoRenewal(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  async register(data: Omit<RegisterFormData, 'confirmPassword'>): Promise<RegisterResponse> {
    try {
      // Validar que firstName y lastName estén presentes
      if (!data.firstName?.trim() || !data.lastName?.trim()) {
        throw new Error('First name and last name are required');
      }

      const registerData: RegisterRequest = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email,
        username: data.username,
        password: data.password,
        branchId: getBrandId(), // Agregar brandId automáticamente
      };

      return await registerUser(registerData);
    } catch (error) {
      throw error;
    }
  }

  async login(data: LoginFormData): Promise<AuthResponse> {
    try {
      console.log('🔍 Login iniciado:', { email: data.email, rememberMe: data.rememberMe });

      // Usar la función de api/endpoints.ts en lugar de fetch directo
      const result = await loginUser({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe || false,
      });

      // result es un BaseResponseDto<LoginData>
      if (!result.success || !result.data) {
        throw new Error(result.errors?.[0]?.description || 'Login failed');
      }

      const authData: AuthResponse = {
        user: result.data.user,  // Ya no necesitamos convertir id
        brand: result.data.brand,  // Agregar brand del backend
        token: result.data.token,
        refreshToken: result.data.refreshToken,
        rememberMe: result.data.rememberMe || false,
      };

      console.log('✅ Login exitoso:', {
        email: authData.user.email,
        rememberMe: authData.rememberMe,
        hasRefreshToken: !!authData.refreshToken
      });

      // Almacenar tokens y datos
      await secureStorage.storeAccessToken(authData.token, authData.rememberMe);
      await secureStorage.storeRememberMe(authData.rememberMe);
      await secureStorage.storeUserData({
        user: authData.user,
        brand: authData.brand,
      }, authData.rememberMe);

      // Almacenar refresh token solo si existe (cuando rememberMe es true)
      if (authData.refreshToken) {
        await secureStorage.storeRefreshToken(authData.refreshToken);
        // Iniciar auto-renovación para sesiones persistentes
        this.startTokenAutoRenewal();
        console.log('🔄 Auto-renovación de token iniciada');
      }

      return authData;
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      console.error('📋 Detalles del error:', {
        message: error.message,
        status: error.status,
        stack: error.stack?.substring(0, 200),
        name: error.name,
        cause: error.cause
      });

      // Propagar el error con más información
      if (error.message?.includes('interno')) {
        throw new Error('Error interno del servidor. Revisa los logs del backend.');
      } else if (error.message?.includes('inválidas') || error.message?.includes('invalid')) {
        throw new Error('Credenciales inválidas');
      } else {
        throw new Error(error.message || 'Error desconocido en el login');
      }
    }
  }

  async refreshToken(): Promise<TokenRefreshResult> {
    try {
      const refreshToken = await secureStorage.getRefreshToken();

      if (!refreshToken) {
        return { success: false, error: 'No refresh token available' };
      }

      console.log('🔄 Renovando token...');

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error renovando token:', errorData);

        // Si el refresh token es inválido, limpiar todo
        if (response.status === 401) {
          await this.logout();
        }

        return { success: false, error: errorData.message || 'Token refresh failed' };
      }

      const result = await response.json();
      const refreshData: RefreshTokenResponse = result.data;

      console.log('✅ Token renovado exitosamente');

      // Almacenar los nuevos tokens
      await secureStorage.storeAccessToken(refreshData.accessToken, true); // Siempre persistente si tiene refresh
      await secureStorage.storeRefreshToken(refreshData.refreshToken);

      // Actualizar datos del usuario
      await secureStorage.storeUserData({
        user: refreshData.user,
        brand: null, // El refresh no devuelve brand info
      }, true);

      return {
        success: true,
        accessToken: refreshData.accessToken,
        refreshToken: refreshData.refreshToken,
      };
    } catch (error) {
      console.error('❌ Error en refreshToken:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('🚪 Logout iniciado...');

      // Detener auto-renovación
      this.stopTokenAutoRenewal();

      // Limpiar todo el almacenamiento
      await secureStorage.clearAll();

      console.log('✅ Logout completado');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      // Intentar limpiar aunque haya errores
      await secureStorage.clearAll();
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const accessToken = await secureStorage.getAccessToken();

      if (!accessToken) {
        return false;
      }

      // Verificar si el token está cerca de expirar
      if (TokenUtils.isTokenNearExpiry(accessToken)) {
        console.log('⚠️ Token cerca de expirar, intentando renovar...');

        // Intentar renovar automáticamente
        const refreshResult = await this.autoRefreshToken();
        return refreshResult;
      }

      return true;
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      return await secureStorage.getUserData();
    } catch (error) {
      console.error('❌ Error obteniendo usuario actual:', error);
      return null;
    }
  }

  async autoRefreshToken(): Promise<boolean> {
    try {
      const hasRefreshToken = await secureStorage.hasRefreshToken();

      if (!hasRefreshToken) {
        console.log('❌ No hay refresh token para auto-renovación');
        return false;
      }

      const result = await this.refreshToken();

      if (result.success) {
        console.log('✅ Auto-renovación exitosa');
        return true;
      } else {
        console.log('❌ Auto-renovación falló:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error en auto-renovación:', error);
      return false;
    }
  }

  async validateEmail(email: string): Promise<boolean> {
    try {
      const response = await validateEmailEndpoint(email, getBrandId());
      return response.success && response.data ? response.data.isAvailable : true;
    } catch (error) {
      console.warn('Email validation failed:', error);
      return true; // Assume available if validation fails
    }
  }

  async validateUsername(username: string): Promise<boolean> {
    try {
      const response = await validateUsernameEndpoint(username);
      return response.success && response.data ? response.data.isAvailable : true;
    } catch (error) {
      console.warn('Username validation failed:', error);
      return true; // Assume available if validation fails
    }
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      return await forgotPasswordEndpoint(email);
    } catch (error) {
      throw error;
    }
  }

  async validateResetCode(data: ValidateResetCodeRequest): Promise<ValidateResetCodeResponse> {
    try {
      return await validateResetCodeEndpoint(data);
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    try {
      return await resetPasswordEndpoint(data);
    } catch (error) {
      throw error;
    }
  }
}

export const authService = new AuthService();