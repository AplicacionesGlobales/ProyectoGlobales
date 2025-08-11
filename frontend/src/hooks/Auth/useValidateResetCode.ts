// Hook para validar código de reset
import { useState } from 'react';
import { authService } from '../../services/authService';
import { ValidateResetCodeResponse } from '../../api/types';

export const useValidateResetCode = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateCode = async (code: string, email: string): Promise<ValidateResetCodeResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.validateResetCode({ code, email });
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al validar el código';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
  };

  return {
    validateCode,
    isLoading,
    error,
    reset,
  };
};