import { ErrorType, ErrorSeverity, ValidationError } from '@/types/error.types';
import { HAPTIC_FEEDBACK_MAP } from '@/constants/ErrorConstants';
import * as Haptics from 'expo-haptics';

export class ErrorUtils {
  /**
   * Validates an email address
   */
  static validateEmail(email: string): ValidationError | null {
    if (!email.trim()) {
      return {
        field: 'email',
        message: 'Email is required',
        type: 'required',
        severity: 'high',
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        field: 'email',
        message: 'Please enter a valid email address',
        type: 'format',
        severity: 'medium',
      };
    }

    return null;
  }

  /**
   * Validates a password
   */
  static validatePassword(password: string, minLength: number = 6): ValidationError | null {
    if (!password) {
      return {
        field: 'password',
        message: 'Password is required',
        type: 'required',
        severity: 'high',
      };
    }

    if (password.length < minLength) {
      return {
        field: 'password',
        message: `Password must be at least ${minLength} characters`,
        type: 'length',
        severity: 'medium',
      };
    }

    return null;
  }

  /**
   * Validates a required field
   */
  static validateRequired(value: string, fieldName: string): ValidationError | null {
    if (!value?.trim()) {
      return {
        field: fieldName.toLowerCase(),
        message: `${fieldName} is required`,
        type: 'required',
        severity: 'high',
      };
    }
    return null;
  }

  /**
   * Validates minimum length
   */
  static validateMinLength(
    value: string,
    minLength: number,
    fieldName: string
  ): ValidationError | null {
    if (value.length < minLength) {
      return {
        field: fieldName.toLowerCase(),
        message: `${fieldName} must be at least ${minLength} characters`,
        type: 'length',
        severity: 'medium',
      };
    }
    return null;
  }

  /**
   * Validates phone number format
   */
  static validatePhone(phone: string): ValidationError | null {
    if (!phone.trim()) {
      return {
        field: 'phone',
        message: 'Phone number is required',
        type: 'required',
        severity: 'medium',
      };
    }

    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return {
        field: 'phone',
        message: 'Please enter a valid phone number',
        type: 'format',
        severity: 'medium',
      };
    }

    return null;
  }

  /**
   * Validates that two passwords match
   */
  static validatePasswordMatch(
    password: string,
    confirmPassword: string
  ): ValidationError | null {
    if (password !== confirmPassword) {
      return {
        field: 'confirmPassword',
        message: 'Passwords do not match',
        type: 'custom',
        severity: 'medium',
      };
    }
    return null;
  }

  /**
   * Triggers haptic feedback based on error type
   */
  static async triggerHapticFeedback(type: ErrorType): Promise<void> {
    try {
      const feedbackType = HAPTIC_FEEDBACK_MAP[type];
      
      switch (feedbackType) {
        case 'notificationError':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'notificationWarning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'notificationSuccess':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        default:
          break;
      }
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  /**
   * Formats API error messages
   */
  static formatApiError(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    if (error?.message) {
      return error.message;
    }

    if (error?.response?.status) {
      switch (error.response.status) {
        case 400:
          return 'Bad request. Please check your input.';
        case 401:
          return 'Unauthorized. Please log in again.';
        case 403:
          return 'Access denied. You do not have permission.';
        case 404:
          return 'Resource not found.';
        case 500:
          return 'Server error. Please try again later.';
        case 503:
          return 'Service unavailable. Please try again later.';
        default:
          return `Request failed with status ${error.response.status}`;
      }
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Determines error severity based on type and context
   */
  static determineSeverity(type: ErrorType, context?: string): ErrorSeverity {
    switch (type) {
      case 'error':
        return context?.includes('network') || context?.includes('server') ? 'critical' : 'high';
      case 'warning':
        return 'medium';
      case 'validation':
        return 'medium';
      case 'info':
        return 'low';
      case 'success':
        return 'low';
      default:
        return 'medium';
    }
  }

  /**
   * Validates form fields and returns array of errors (synchronous)
   */
  static validateForm(
    fields: Record<string, string>,
    validationRules: Record<string, (value: string) => ValidationError | null>
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    Object.entries(fields).forEach(([fieldName, value]) => {
      const validator = validationRules[fieldName];
      if (validator) {
        const error = validator(value);
        if (error) {
          errors.push(error);
        }
      }
    });

    return errors;
  }

  /**
   * Validates all login fields synchronously
   */
  static validateLoginForm(email: string, password: string): Record<string, string | null> {
    const errors: Record<string, string | null> = {};

    const emailError = ErrorUtils.validateEmail(email);
    if (emailError) errors.email = emailError.message;

    const passwordError = ErrorUtils.validatePassword(password, 6);
    if (passwordError) errors.password = passwordError.message;

    return errors;
  }

  /**
   * Validates all registration fields synchronously
   */
  static validateRegistrationForm(
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    password: string,
    confirmPassword: string
  ): Record<string, string | null> {
    const errors: Record<string, string | null> = {};

    const firstNameError = ErrorUtils.validateRequired(firstName, 'First name');
    if (firstNameError) {
      errors.firstName = firstNameError.message;
    } else if (firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    const lastNameError = ErrorUtils.validateRequired(lastName, 'Last name');
    if (lastNameError) {
      errors.lastName = lastNameError.message;
    } else if (lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    const emailError = ErrorUtils.validateEmail(email);
    if (emailError) errors.email = emailError.message;

    const usernameError = ErrorUtils.validateRequired(username, 'Username');
    if (usernameError) {
      errors.username = usernameError.message;
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    const passwordError = ErrorUtils.validatePassword(password, 8);
    if (passwordError) errors.password = passwordError.message;

    const confirmError = ErrorUtils.validatePasswordMatch(password, confirmPassword);
    if (confirmError) errors.confirmPassword = confirmError.message;

    return errors;
  }

  /**
   * Validates a single field and returns error message (synchronous)
   */
  static validateSingleField(field: string, value: string, additionalValue?: string): string | null {
    switch(field) {
      case 'firstName':
      case 'lastName':
        const nameError = ErrorUtils.validateRequired(value, field === 'firstName' ? 'First name' : 'Last name');
        if (nameError) return nameError.message;
        if (value.length < 2) return `${field === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
        return null;

      case 'email':
        const emailError = ErrorUtils.validateEmail(value);
        return emailError ? emailError.message : null;

      case 'username':
        const usernameError = ErrorUtils.validateRequired(value, 'Username');
        if (usernameError) return usernameError.message;
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
        return null;

      case 'password':
        const passwordError = ErrorUtils.validatePassword(value, 8);
        return passwordError ? passwordError.message : null;

      case 'confirmPassword':
        if (!additionalValue) return 'Password is required for confirmation';
        const confirmError = ErrorUtils.validatePasswordMatch(additionalValue, value);
        return confirmError ? confirmError.message : null;

      default:
        return null;
    }
  }

  /**
   * Debounces validation to avoid excessive error messages
   */
  static debounceValidation<T extends (...args: any[]) => any>(
    func: T,
    delay: number = 300
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Generates a unique error ID for tracking
   */
  static generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitizes error messages for display
   */
  static sanitizeMessage(message: string, maxLength: number = 200): string {
    if (!message || typeof message !== 'string') {
      return 'An error occurred';
    }

    // Remove any HTML tags
    const cleanMessage = message.replace(/<[^>]*>/g, '');
    
    // Truncate if too long
    if (cleanMessage.length > maxLength) {
      return cleanMessage.substring(0, maxLength - 3) + '...';
    }

    return cleanMessage;
  }
}
