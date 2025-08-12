import { useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { useDebounce } from './useDebounce';

interface UseUsernameValidationReturn {
  isValidating: boolean;
  isUsernameAvailable: boolean | null;
  validateUsernameRealtime: (username: string) => void;
  clearValidation: () => void;
}

export const useUsernameValidation = (): UseUsernameValidationReturn => {
  const [isValidating, setIsValidating] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const { debounce } = useDebounce();

  const validateUsername = useCallback(async (username: string) => {
    if (!username || username.trim().length < 3) {
      setIsUsernameAvailable(null);
      setIsValidating(false);
      return;
    }

    try {
      const isAvailable = await authService.validateUsername(username);
      setIsUsernameAvailable(isAvailable);
    } catch (error) {
      console.warn('Username validation error:', error);
      setIsUsernameAvailable(null);
    } finally {
      setIsValidating(false);
    }
  }, []);

  const debouncedValidateUsername = useCallback(
    debounce(validateUsername, 1000), // 1 segundo de delay
    [validateUsername, debounce]
  );

  const validateUsernameRealtime = useCallback((username: string) => {
    if (!username || username.trim().length < 3) {
      setIsUsernameAvailable(null);
      setIsValidating(false);
      return;
    }

    setIsValidating(true);
    debouncedValidateUsername(username);
  }, [debouncedValidateUsername]);

  const clearValidation = useCallback(() => {
    setIsUsernameAvailable(null);
    setIsValidating(false);
  }, []);

  return {
    isValidating,
    isUsernameAvailable,
    validateUsernameRealtime,
    clearValidation,
  };
};
