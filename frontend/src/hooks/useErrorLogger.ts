import { useCallback } from 'react';
import { logger, LogLevel } from '@/utils/logger';
import { useError } from '@/contexts/ErrorContext';

export interface UseErrorLoggerReturn {
  logAndShowError: (message: string, error?: Error, context?: Record<string, any>) => void;
  logAndShowApiError: (endpoint: string, method: string, error: any, context?: Record<string, any>) => void;
  logAndShowValidationError: (field: string, message: string, context?: Record<string, any>) => void;
  logAndShowNetworkError: (retryAction?: () => void, context?: Record<string, any>) => void;
  logUserAction: (action: string, context?: Record<string, any>) => void;
  logApiCall: (endpoint: string, method: string, success: boolean, context?: Record<string, any>) => void;
}

/**
 * Custom hook that combines logging with error display
 * Follows Single Responsibility Principle - handles logging + UI feedback
 */
export const useErrorLogger = (): UseErrorLoggerReturn => {
  const { showApiError, showValidationErrors, showNetworkError, showToast } = useError();

  const logAndShowError = useCallback(
    (message: string, error?: Error, context?: Record<string, any>) => {
      logger.error(message, context, error);
      showToast(message, 'error', 'high');
    },
    [showToast]
  );

  const logAndShowApiError = useCallback(
    (endpoint: string, method: string, error: any, context?: Record<string, any>) => {
      // Log the technical details
      logger.apiError(endpoint, method, error?.status || error?.response?.status, error);
      
      // Show user-friendly error
      showApiError(error, context?.fallbackMessage);
    },
    [showApiError]
  );

  const logAndShowValidationError = useCallback(
    (field: string, message: string, context?: Record<string, any>) => {
      logger.warn(`Validation error on field: ${field}`, {
        field,
        message,
        ...context
      });
      
      showValidationErrors([{ field, message }]);
    },
    [showValidationErrors]
  );

  const logAndShowNetworkError = useCallback(
    (retryAction?: () => void, context?: Record<string, any>) => {
      logger.error('Network connection failed', {
        hasRetryAction: !!retryAction,
        ...context
      });
      
      showNetworkError(retryAction);
    },
    [showNetworkError]
  );

  const logUserAction = useCallback(
    (action: string, context?: Record<string, any>) => {
      logger.userAction(action, context);
    },
    []
  );

  const logApiCall = useCallback(
    (endpoint: string, method: string, success: boolean, context?: Record<string, any>) => {
      if (success) {
        logger.debug(`API Call Success: ${method} ${endpoint}`, context);
      } else {
        logger.warn(`API Call Failed: ${method} ${endpoint}`, context);
      }
    },
    []
  );

  return {
    logAndShowError,
    logAndShowApiError,
    logAndShowValidationError,
    logAndShowNetworkError,
    logUserAction,
    logApiCall,
  };
};
