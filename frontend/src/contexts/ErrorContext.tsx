import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  ErrorContextType, 
  ErrorType, 
  ErrorSeverity,
  ToastErrorConfig,
  BannerErrorConfig,
  ModalErrorConfig
} from '@/types/error.types';
import { ErrorUtils } from '@/utils/errorUtils';

interface ErrorProviderProps {
  children: ReactNode;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [toastErrors, setToastErrors] = useState<ToastErrorConfig[]>([]);
  const [bannerError, setBannerError] = useState<BannerErrorConfig | null>(null);
  const [modalError, setModalError] = useState<ModalErrorConfig | null>(null);
  const [globalLoading, setGlobalLoading] = useState(false);

  const showToast = useCallback(
    (
      message: string,
      type: ErrorType = 'error',
      severity: ErrorSeverity = 'medium',
      duration?: number,
      action?: () => void,
      actionLabel?: string
    ) => {
      const id = ErrorUtils.generateErrorId();
      const sanitizedMessage = ErrorUtils.sanitizeMessage(message);
      
      const toastConfig: ToastErrorConfig = {
        id,
        message: sanitizedMessage,
        type,
        severity,
        duration: duration || (severity === 'critical' ? 8000 : severity === 'high' ? 6000 : 4000),
        isVisible: true,
        action,
        actionLabel,
        timestamp: Date.now(),
      };

      setToastErrors(prev => [...prev, toastConfig]);

      // Trigger haptic feedback
      ErrorUtils.triggerHapticFeedback(type);

      // Auto-remove toast after duration
      setTimeout(() => {
        hideToast(id);
      }, toastConfig.duration);

      return id;
    },
    []
  );

  const hideToast = useCallback((id: string) => {
    setToastErrors(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showBanner = useCallback(
    (
      message: string,
      type: ErrorType = 'error',
      severity: ErrorSeverity = 'medium',
      isDismissible: boolean = true,
      action?: () => void,
      actionLabel?: string
    ) => {
      const sanitizedMessage = ErrorUtils.sanitizeMessage(message);
      
      const bannerConfig: BannerErrorConfig = {
        message: sanitizedMessage,
        type,
        severity,
        isDismissible,
        isVisible: true,
        action,
        actionLabel,
        timestamp: Date.now(),
      };

      setBannerError(bannerConfig);
      ErrorUtils.triggerHapticFeedback(type);
    },
    []
  );

  const hideBanner = useCallback(() => {
    setBannerError(null);
  }, []);

  const showModal = useCallback(
    (
      title: string,
      message: string,
      type: ErrorType = 'error',
      severity: ErrorSeverity = 'medium',
      primaryAction?: () => void,
      primaryActionLabel?: string,
      secondaryAction?: () => void,
      secondaryActionLabel?: string,
      isDismissible: boolean = true
    ) => {
      const sanitizedMessage = ErrorUtils.sanitizeMessage(message);
      
      const modalConfig: ModalErrorConfig = {
        title,
        message: sanitizedMessage,
        type,
        severity,
        isVisible: true,
        primaryAction,
        primaryActionLabel: primaryActionLabel || 'OK',
        secondaryAction,
        secondaryActionLabel,
        isDismissible,
        timestamp: Date.now(),
      };

      setModalError(modalConfig);
      ErrorUtils.triggerHapticFeedback(type);
    },
    []
  );

  const hideModal = useCallback(() => {
    setModalError(null);
  }, []);

  const clearAllErrors = useCallback(() => {
    setToastErrors([]);
    setBannerError(null);
    setModalError(null);
  }, []);

  const showApiError = useCallback(
    (error: any, fallbackMessage?: string) => {
      const message = ErrorUtils.formatApiError(error) || fallbackMessage || 'An unexpected error occurred';
      const severity = ErrorUtils.determineSeverity('error', 'api');
      
      showToast(message, 'error', severity);
    },
    [showToast]
  );

  const showValidationErrors = useCallback(
    (errors: Array<{ field: string; message: string }>) => {
      if (errors.length === 1) {
        showToast(errors[0].message, 'validation', 'medium');
      } else if (errors.length > 1) {
        const message = `Please fill in all ${errors.length} fields with valid data`;
        showBanner(message, 'validation', 'medium', true);
      }
    },
    [showToast, showBanner]
  );

  const showNetworkError = useCallback(
    (retryAction?: () => void) => {
      const message = 'Network connection failed. Please check your internet connection.';
      
      if (retryAction) {
        showBanner(
          message,
          'error',
          'critical',
          true,
          retryAction,
          'Retry'
        );
      } else {
        showToast(message, 'error', 'critical');
      }
    },
    [showToast, showBanner]
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'success', 'low', duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'info', 'low', duration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'warning', 'medium', duration);
    },
    [showToast]
  );

  const setLoading = useCallback((loading: boolean) => {
    setGlobalLoading(loading);
  }, []);

  const contextValue: ErrorContextType = {
    // State
    toastErrors,
    bannerError,
    modalError,
    globalLoading,

    // Toast methods
    showToast,
    hideToast,

    // Banner methods
    showBanner,
    hideBanner,

    // Modal methods
    showModal,
    hideModal,

    // Utility methods
    clearAllErrors,
    showApiError,
    showValidationErrors,
    showNetworkError,
    showSuccess,
    showInfo,
    showWarning,
    setLoading,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

// Convenience hooks
export const useToast = () => {
  const { showToast, hideToast, toastErrors } = useError();
  return { showToast, hideToast, toastErrors };
};

export const useBanner = () => {
  const { showBanner, hideBanner, bannerError } = useError();
  return { showBanner, hideBanner, bannerError };
};

export const useModal = () => {
  const { showModal, hideModal, modalError } = useError();
  return { showModal, hideModal, modalError };
};

export const useErrorHandling = () => {
  const { 
    showApiError, 
    showValidationErrors, 
    showNetworkError, 
    clearAllErrors 
  } = useError();
  
  return { 
    showApiError, 
    showValidationErrors, 
    showNetworkError, 
    clearAllErrors 
  };
};
