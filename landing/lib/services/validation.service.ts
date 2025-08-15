/**
 * Validation Service
 * Handles all validation-related API calls
 * Follows Single Responsibility Principle
 */

import { apiClient } from '../api/client';
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
      const response = await apiClient.post<ValidationResponse>(
        API_ROUTES.VALIDATION.EMAIL,
        { email }
      );
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return {
        success: false,
        data: { isAvailable: false, email },
        errors: [{ field: 'email', description: 'Error al validar email' }]
      };
    } catch (error) {
      console.error('Email validation failed:', error);
      return {
        success: false,
        data: { isAvailable: false, email },
        errors: [{ field: 'email', description: 'Error al validar email' }]
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
      const response = await apiClient.post<ValidationResponse>(
        API_ROUTES.VALIDATION.USERNAME,
        { username }
      );
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return {
        success: false,
        data: { isAvailable: false, username },
        errors: [{ field: 'username', description: 'Error al validar username' }]
      };
    } catch (error) {
      console.error('Username validation failed:', error);
      return {
        success: false,
        data: { isAvailable: false, username },
        errors: [{ field: 'username', description: 'Error al validar username' }]
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
