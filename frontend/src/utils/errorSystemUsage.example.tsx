// Ejemplo de cómo usar el sistema de manejo de errores en un componente
import React from 'react';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { authService } from '@/services/authService';

export const ExampleUsage: React.FC = () => {
  const { logAndShowApiError, logUserAction, logApiCall } = useErrorLogger();

  const handleLogin = async (email: string, password: string) => {
    try {
      // Log user action
      logUserAction('login_attempt', { email });

      // Make API call
      const response = await authService.login({ email, password });
      
      // Log successful API call
      logApiCall('/auth/login', 'POST', true, { userId: response.user?.id });

      // Continue with success handling...
    } catch (error) {
      // Log and show error to user
      logAndShowApiError('/auth/login', 'POST', error, {
        fallbackMessage: 'Failed to log in. Please try again.'
      });
    }
  };

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
};

/*
  INTEGRACIÓN RECOMENDADA:

  1. En tus hooks existentes (useRegister, useLogin, etc.):
     - Reemplaza console.log por logger calls
     - Usa logAndShowApiError para errores API
     - Usa logUserAction para acciones del usuario

  2. En tus servicios API:
     - Agrega logging antes y después de llamadas
     - Usa logger.apiError() para errores específicos

  3. En el App.tsx principal:
     - Inicializa el errorBoundaryService
     - Conecta con tu ErrorProvider existente

  EJEMPLO MÍNIMO DE INTEGRACIÓN:

  // En useRegister.ts
  import { useErrorLogger } from '@/hooks/useErrorLogger';
  
  const { logAndShowApiError, logUserAction } = useErrorLogger();
  
  // Reemplazar:
  // console.log('Registration attempt');
  // Por:
  // logUserAction('registration_attempt', { email });
  
  // Reemplazar:
  // showApiError(error);
  // Por:
  // logAndShowApiError('/auth/register', 'POST', error);
*/
