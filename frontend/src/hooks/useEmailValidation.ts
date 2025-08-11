import { useState, useCallback, useEffect } from 'react';
import { authService } from '../services/authService';
import { useDebounce } from './useDebounce';

interface UseEmailValidationReturn {
  isValidating: boolean;
  isEmailAvailable: boolean | null;
  validateEmailRealtime: (email: string) => void;
  clearValidation: () => void;
}

export const useEmailValidation = (): UseEmailValidationReturn => {
  const [isValidating, setIsValidating] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const { debounce } = useDebounce();

  const validateEmail = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) {
      setIsEmailAvailable(null);
      setIsValidating(false);
      return;
    }

    try {
      const isAvailable = await authService.validateEmail(email);
      setIsEmailAvailable(isAvailable);
    } catch (error) {
      console.warn('Email validation error:', error);
      setIsEmailAvailable(null);
    } finally {
      setIsValidating(false);
    }
  }, []);

  const debouncedValidateEmail = useCallback(
    debounce(validateEmail, 800), // 800ms delay
    [validateEmail, debounce]
  );

  const validateEmailRealtime = useCallback((email: string) => {
    if (!email || !email.includes('@')) {
      setIsEmailAvailable(null);
      setIsValidating(false);
      return;
    }

    setIsValidating(true);
    debouncedValidateEmail(email);
  }, [debouncedValidateEmail]);

  const clearValidation = useCallback(() => {
    setIsEmailAvailable(null);
    setIsValidating(false);
  }, []);

  return {
    isValidating,
    isEmailAvailable,
    validateEmailRealtime,
    clearValidation,
  };
};
