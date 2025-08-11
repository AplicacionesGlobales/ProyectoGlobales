// Error Components
export { InlineError } from './InlineError';
export { ToastError } from './ToastError';
export { BannerError } from './BannerError';
export { ModalError } from './ModalError';
export { ErrorContainer, ErrorBoundary } from './ErrorContainer';

// Error Context and Hooks
export { ErrorProvider, useError, useToast, useBanner, useModal, useErrorHandling } from '@/contexts/ErrorContext';

// Error Types
export type {
  ErrorType,
  ErrorSeverity,
  ErrorPosition,
  BaseErrorProps,
  InlineErrorProps,
  ToastErrorProps,
  BannerErrorProps,
  ModalErrorProps,
  ValidationError,
  ErrorContextType,
  ToastErrorConfig,
  BannerErrorConfig,
  ModalErrorConfig,
} from '@/types/error.types';

// Error Utilities
export { ErrorUtils } from '@/utils/errorUtils';

// Error Constants
export {
  ERROR_ICONS,
  ERROR_COLORS,
  DEFAULT_ERROR_CONFIG,
  HAPTIC_FEEDBACK_MAP,
  ACCESSIBILITY_LABELS,
  ANIMATION_PRESETS,
} from '@/constants/ErrorConstants';
