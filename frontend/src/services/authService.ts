import { RegisterFormData, LoginFormData, RegisterResponse } from '../types/auth.types';

export interface IAuthService {
  register(data: Omit<RegisterFormData, 'confirmPassword'>): Promise<RegisterResponse>;
  login(data: LoginFormData): Promise<any>;
  validateEmail(email: string): Promise<boolean>;
  validateUsername(username: string): Promise<boolean>;
}

class AuthService implements IAuthService {
  private baseURL: string;

  constructor(baseURL: string = process.env.API_URL || 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  async register(data: Omit<RegisterFormData, 'confirmPassword'>): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  async login(data: LoginFormData): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  async validateEmail(email: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/auth/validate-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data.available;
    } catch {
      return true;
    }
  }

  async validateUsername(username: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/auth/validate-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      return data.available;
    } catch {
      return true;
    }
  }
}

export const authService = new AuthService();