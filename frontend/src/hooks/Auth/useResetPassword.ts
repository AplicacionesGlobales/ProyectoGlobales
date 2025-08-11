import { useState } from 'react';
import { authService } from '../../services/authService';
import { ResetPasswordResponse } from '../../api/types';

export const useResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const resetPassword = async (
    code: string, 
    email: string, 
    password: string, 
    confirmPassword: string
  ): Promise<ResetPasswordResponse | null> => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const response = await authService.resetPassword({
        code,
        email,
        password,
        confirmPassword
      });
      
      if (response.success) {
        setIsSuccess(true);
      } else {
        setError(response.message);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al restablecer la contraseña';
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
    resetPassword,
    isLoading,
    error,
    isSuccess,
    reset,
  };
};