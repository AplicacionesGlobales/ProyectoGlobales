import { useState, useCallback } from 'react';
import { RegisterFormData, AuthError } from '../types/auth.types';
import { RegisterResponse } from '../api/types';
import { authService } from '../services/authService';
import { AuthValidators } from '../utils/validators';

interface UseRegisterReturn {
  register: (data: RegisterFormData) => Promise<void>;
  loading: boolean;
  error: AuthError | null;
  success: boolean;
  errors: Partial<Record<keyof RegisterFormData, string>>;
  validateField: (field: keyof RegisterFormData, value: string, compareValue?: string) => void;
  clearErrors: () => void;
  clearFieldError: (field: keyof RegisterFormData) => void;
}

export const useRegister = (
  onSuccess?: (response: RegisterResponse) => void,
  onError?: (error: AuthError) => void
): UseRegisterReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});

  const validateField = useCallback((
    field: keyof RegisterFormData,
    value: string,
    compareValue?: string
  ) => {
    let fieldError: string | null = null;

    switch (field) {
      case 'email':
        fieldError = AuthValidators.email(value);
        break;

      case 'username':
        fieldError = AuthValidators.username(value);
        break;

      case 'password':
        fieldError = AuthValidators.password(value);
        break;

      case 'confirmPassword':
        fieldError = AuthValidators.confirmPassword(compareValue || '', value);
        break;

      case 'firstName':
        if (value) {
          fieldError = AuthValidators.validateName(value, 'First name');
        }
        break;

      case 'lastName':
        if (value) {
          fieldError = AuthValidators.validateName(value, 'Last name');
        }
        break;

      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: fieldError || undefined,
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setError(null);
  }, []);

  const clearFieldError = useCallback((field: keyof RegisterFormData) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const register = useCallback(async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate all required fields
      const validationErrors: Partial<Record<keyof RegisterFormData, string>> = {};

      // Validate email
      const emailError = AuthValidators.email(data.email);
      if (emailError) validationErrors.email = emailError;

      // Validate username
      const usernameError = AuthValidators.username(data.username);
      if (usernameError) validationErrors.username = usernameError;

      // Validate password
      const passwordError = AuthValidators.password(data.password);
      if (passwordError) validationErrors.password = passwordError;

      // Validate confirm password
      const confirmPasswordError = AuthValidators.confirmPassword(data.password, data.confirmPassword);
      if (confirmPasswordError) validationErrors.confirmPassword = confirmPasswordError;

      // Validate optional fields
      if (data.firstName) {
        const firstNameError = AuthValidators.validateName(data.firstName, 'First name');
        if (firstNameError) validationErrors.firstName = firstNameError;
      }

      if (data.lastName) {
        const lastNameError = AuthValidators.validateName(data.lastName, 'Last name');
        if (lastNameError) validationErrors.lastName = lastNameError;
      }

      // Check if there are validation errors
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        const errorMessages = Object.values(validationErrors);
        const firstError = errorMessages[0];
        throw new Error(firstError || 'Please fix the validation errors');
      }

      // Optional: Check if email and username are available
      // Solo si tu backend tiene estos endpoints
      if (authService.validateEmail && authService.validateUsername) {
        try {
          const [emailAvailable, usernameAvailable] = await Promise.all([
            authService.validateEmail(data.email),
            authService.validateUsername(data.username),
          ]);

          if (!emailAvailable) {
            setErrors(prev => ({ ...prev, email: 'Email is already taken' }));
            throw new Error('Email is already taken');
          }

          if (!usernameAvailable) {
            setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
            throw new Error('Username is already taken');
          }
        } catch (validationError) {
          // Si los endpoints no existen o fallan, continuar con el registro
          console.log('Validation endpoints not available, proceeding with registration');
        }
      }

      // Prepare data for registration (remove confirmPassword)
      const { confirmPassword, ...registerData } = data;

      // Call register service
      const response = await authService.register(registerData);

      // Set success state
      setSuccess(true);

      // Call success callback
      if (onSuccess) {
        onSuccess(response);
      }

    } catch (err) {
      // Handle error
      let authError: AuthError;

      if (err instanceof Error) {
        authError = {
          message: err.message,
          code: 'code' in err ? (err as any).code : 'REGISTRATION_ERROR',
        };
      } else if (typeof err === 'string') {
        authError = {
          message: err,
          code: 'REGISTRATION_ERROR',
        };
      } else {
        authError = {
          message: 'An unexpected error occurred during registration',
          code: 'UNKNOWN_ERROR',
        };
      }

      setError(authError);

      // Call error callback
      if (onError) {
        onError(authError);
      }
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  return {
    register,
    loading,
    error,
    success,
    errors,
    validateField,
    clearErrors,
    clearFieldError,
  };
};