import { apiClient } from '../api';
import { API_ROUTES } from '../constants/api-routes';

// Types
export interface EmailValidationRequest {
  email: string;
}

export interface UsernameValidationRequest {
  username: string;
}

export interface ValidationResponse {
  success: boolean;
  data: {
    isAvailable: boolean;
    username?: string;
    email?: string;
  };
  errors?: Array<{ field: string; description: string }>;
}

/**
 * Validation Service Class
 * Encapsulates all validation operations
 */
export class ValidationService {
  /**
   * Validates email availability
   * @param email - Email to validate
   * @returns Promise<ValidationResponse>
   */
  async validateEmail(email: string): Promise<ValidationResponse> {
    try {
      console.log('🔍 Validating email:', email);
      
      const response = await apiClient.post(
        API_ROUTES.VALIDATION.EMAIL,
        { email }
      );
      
      console.log('📧 Email validation response:', response);
      
      // El response ya viene como BaseResponseDto desde el backend
      if (response.success && response.data) {
        return {
          success: true,
          data: {
            isAvailable: (response.data as { isAvailable: boolean; email: string }).isAvailable,
            email: (response.data as { isAvailable: boolean; email: string }).email
          }
        };
      }
      
      // Si hay errores en la respuesta
      return {
        success: false,
        data: { isAvailable: false, email },
        errors: response.errors
          ? response.errors.map((err: any) => ({
              field: err.field || 'email',
              description: err.description
            }))
          : [{ field: 'email', description: 'Error al validar email' }]
      };
      
    } catch (error: any) {
      console.error('❌ Email validation failed:', error);
      
      // Extraer mensaje de error más específico
      let errorMessage = 'Error al validar email';
      
      if (error?.response?.data?.errors?.[0]?.description) {
        errorMessage = error.response.data.errors[0].description;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        data: { isAvailable: false, email },
        errors: [{ field: 'email', description: errorMessage }]
      };
    }
  }

  /**
   * Validates username availability
   * @param username - Username to validate
   * @returns Promise<ValidationResponse>
   */
  async validateUsername(username: string): Promise<ValidationResponse> {
    try {
      console.log('🔍 Validating username:', username);
      
      const response = await apiClient.post(
        API_ROUTES.VALIDATION.USERNAME,
        { username }
      );
      
      console.log('👤 Username validation response:', response);
      
      // El response ya viene como BaseResponseDto desde el backend
      if (response.success && response.data) {
        return {
          success: true,
          data: {
            isAvailable: (response.data as { isAvailable: boolean; username: string }).isAvailable,
            username: (response.data as { isAvailable: boolean; username: string }).username
          }
        };
      }
      
      // Si hay errores en la respuesta
      return {
        success: false,
        data: { isAvailable: false, username },
        errors: response.errors
          ? response.errors.map((err: any) => ({
              field: err.field || 'username',
              description: err.description
            }))
          : [{ field: 'username', description: 'Error al validar username' }]
      };
      
    } catch (error: any) {
      console.error('❌ Username validation failed:', error);
      
      // Extraer mensaje de error más específico
      let errorMessage = 'Error al validar username';
      
      if (error?.response?.data?.errors?.[0]?.description) {
        errorMessage = error.response.data.errors[0].description;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        data: { isAvailable: false, username },
        errors: [{ field: 'username', description: errorMessage }]
      };
    }
  }

  /**
   * Validates multiple fields at once
   * @param fields - Object with email and/or username
   * @returns Promise with validation results
   */
  async validateFields(fields: { email?: string; username?: string }) {
    const results: { email?: ValidationResponse; username?: ValidationResponse } = {};
    const promises = [];

    if (fields.email) {
      promises.push(
        this.validateEmail(fields.email).then(result => {
          results.email = result;
        })
      );
    }

    if (fields.username) {
      promises.push(
        this.validateUsername(fields.username).then(result => {
          results.username = result;
        })
      );
    }

    await Promise.all(promises);
    return results;
  }
}

// Export singleton instance
export const validationService = new ValidationService();