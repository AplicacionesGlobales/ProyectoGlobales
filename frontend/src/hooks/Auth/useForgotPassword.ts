import { useState } from 'react';
import { authService } from '../../services/authService';
import {  ForgotPasswordResponse } from '../../api/types';

// Hook para solicitar código de reset
export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const forgotPassword = async (email: string): Promise<ForgotPasswordResponse | null> => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const response = await authService.forgotPassword(email);
      setIsSuccess(true);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar el código de recuperación';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
  };

  return {
    forgotPassword,
    isLoading,
    error,
    isSuccess,
    reset,
  };
};