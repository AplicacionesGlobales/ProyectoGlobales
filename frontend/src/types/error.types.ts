import { ReactNode } from 'react';

export type ErrorType = 'error' | 'warning' | 'info' | 'success' | 'validation';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ErrorPosition = 'top' | 'bottom' | 'center' | 'inline';

export interface BaseErrorProps {
  message: string;
  type: ErrorType;
  severity?: ErrorSeverity;
  visible?: boolean;
  dismissible?: boolean;
  autoHide?: boolean;
  autoHideDuration?: number;
  onDismiss?: () => void;
  onPress?: () => void;
  testID?: string;
}

export interface InlineErrorProps extends BaseErrorProps {
  position?: 'inline';
  compact?: boolean;
  showIcon?: boolean;
}

export interface ToastErrorProps extends BaseErrorProps {
  position?: Exclude<ErrorPosition, 'inline'>;
  animated?: boolean;
  swipeToDismiss?: boolean;
  actionText?: string;
  onActionPress?: () => void;
}

export interface BannerErrorProps extends BaseErrorProps {
  fullWidth?: boolean;
  sticky?: boolean;
  actions?: Array<{
    text: string;
    onPress: () => void;
    primary?: boolean;
  }>;
}

export interface ModalErrorProps extends BaseErrorProps {
  title?: string;
  description?: string;
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
  icon?: ReactNode;
}

export interface ErrorConfig {
  defaultDuration: number;
  showIcons: boolean;
  enableHapticFeedback: boolean;
  enableSounds: boolean;
  animationDuration: number;
}

export type ErrorIconMap = {
  [key in ErrorType]: string;
};

export type ErrorColorMap = {
  [key in ErrorType]: {
    background: string;
    border: string;
    text: string;
    icon: string;
  };
};

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'length' | 'custom';
  severity?: ErrorSeverity;
}

// Configuration types for state management
export interface ToastErrorConfig extends ToastErrorProps {
  id: string;
  timestamp: number;
  duration: number;
  isVisible: boolean;
  action?: () => void;
  actionLabel?: string;
}

export interface BannerErrorConfig extends BannerErrorProps {
  timestamp: number;
  isVisible: boolean;
  isDismissible: boolean;
  action?: () => void;
  actionLabel?: string;
}

export interface ModalErrorConfig extends ModalErrorProps {
  timestamp: number;
  isVisible: boolean;
  isDismissible: boolean;
  primaryAction?: () => void;
  primaryActionLabel?: string;
  secondaryAction?: () => void;
  secondaryActionLabel?: string;
}

export interface ErrorContextType {
  // State
  toastErrors: ToastErrorConfig[];
  bannerError: BannerErrorConfig | null;
  modalError: ModalErrorConfig | null;
  globalLoading: boolean;

  // Toast methods
  showToast: (
    message: string,
    type?: ErrorType,
    severity?: ErrorSeverity,
    duration?: number,
    action?: () => void,
    actionLabel?: string
  ) => string;
  hideToast: (id: string) => void;

  // Banner methods
  showBanner: (
    message: string,
    type?: ErrorType,
    severity?: ErrorSeverity,
    isDismissible?: boolean,
    action?: () => void,
    actionLabel?: string
  ) => void;
  hideBanner: () => void;

  // Modal methods
  showModal: (
    title: string,
    message: string,
    type?: ErrorType,
    severity?: ErrorSeverity,
    primaryAction?: () => void,
    primaryActionLabel?: string,
    secondaryAction?: () => void,
    secondaryActionLabel?: string,
    isDismissible?: boolean
  ) => void;
  hideModal: () => void;

  // Utility methods
  clearAllErrors: () => void;
  showApiError: (error: any, fallbackMessage?: string) => void;
  showValidationErrors: (errors: Array<{ field: string; message: string }>) => void;
  showNetworkError: (retryAction?: () => void) => void;
  showSuccess: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  setLoading: (loading: boolean) => void;
}
