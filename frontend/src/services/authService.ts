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
import { RegisterFormData, LoginFormData } from '../types/auth.types';

export interface IAuthService {
  register(data: Omit<RegisterFormData, 'confirmPassword'>): Promise<RegisterResponse>;
  login(data: LoginFormData): Promise<LoginResponse>;
  validateEmail(email: string): Promise<boolean>;
  validateUsername(username: string): Promise<boolean>;
  forgotPassword(email: string): Promise<ForgotPasswordResponse>;
  validateResetCode(data: ValidateResetCodeRequest): Promise<ValidateResetCodeResponse>;
  resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse>;
}

class AuthService implements IAuthService {
  private baseURL: string;

  constructor(baseURL: string = process.env.API_URL || 'http://localhost:3000') {
    this.baseURL = baseURL;
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
      };

      return await registerUser(registerData);
    } catch (error) {
      throw error;
    }
  }

  async login(data: LoginFormData): Promise<LoginResponse> {
    try {
      const loginData: LoginRequest = {
        email: data.email,
        password: data.password,
      };

      return await loginUser(loginData);
    } catch (error) {
      throw error;
    }
  }

  async validateEmail(email: string): Promise<boolean> {
    try {
      const response = await validateEmailEndpoint(email);
      return response.available;
    } catch (error) {
      console.warn('Email validation failed:', error);
      return true; // Assume available if validation fails
    }
  }

  async validateUsername(username: string): Promise<boolean> {
    try {
      const response = await validateUsernameEndpoint(username);
      return response.available;
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