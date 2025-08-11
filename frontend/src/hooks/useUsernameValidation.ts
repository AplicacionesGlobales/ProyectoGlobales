import { useState, useCallback } from 'react';
import { authService } from '../services/authService';

interface UseUsernameValidationReturn {
  isValidating: boolean;
  isUsernameAvailable: boolean | null;
  validateUsernameRealtime: (username: string) => Promise<void>;
  clearValidation: () => void;
}

export const useUsernameValidation = (): UseUsernameValidationReturn => {
  const [isValidating, setIsValidating] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);

  const validateUsernameRealtime = useCallback(async (username: string) => {
    if (!username || username.trim().length < 3) {
      setIsUsernameAvailable(null);
      return;
    }

    setIsValidating(true);
    
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
