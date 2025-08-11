import { ErrorConfig, ErrorIconMap } from '@/types/error.types';

export const ERROR_ICONS: ErrorIconMap = {
  error: 'alert-circle',
  warning: 'warning',
  info: 'information-circle',
  success: 'checkmark-circle',
  validation: 'close-circle',
};

export const ERROR_COLORS = {
  light: {
    error: {
      background: '#fef2f2',
      border: '#fecaca',
      text: '#dc2626',
      icon: '#ef4444',
    },
    warning: {
      background: '#fffbeb',
      border: '#fed7aa',
      text: '#d97706',
      icon: '#f59e0b',
    },
    info: {
      background: '#eff6ff',
      border: '#bfdbfe',
      text: '#2563eb',
      icon: '#3b82f6',
    },
    success: {
      background: '#f0fdf4',
      border: '#bbf7d0',
      text: '#059669',
      icon: '#10b981',
    },
    validation: {
      background: '#fef2f2',
      border: '#fca5a5',
      text: '#dc2626',
      icon: '#ef4444',
    },
  },
  dark: {
    error: {
      background: '#450a0a',
      border: '#7f1d1d',
      text: '#fca5a5',
      icon: '#ef4444',
    },
    warning: {
      background: '#451a03',
      border: '#a16207',
      text: '#fed7aa',
      icon: '#f59e0b',
    },
    info: {
      background: '#1e3a8a',
      border: '#3730a3',
      text: '#bfdbfe',
      icon: '#3b82f6',
    },
    success: {
      background: '#064e3b',
      border: '#047857',
      text: '#bbf7d0',
      icon: '#10b981',
    },
    validation: {
      background: '#450a0a',
      border: '#7f1d1d',
      text: '#fca5a5',
      icon: '#ef4444',
    },
  },
};

export const DEFAULT_ERROR_CONFIG: ErrorConfig = {
  defaultDuration: 4000,
  showIcons: true,
  enableHapticFeedback: true,
  enableSounds: false,
  animationDuration: 300,
};

export const HAPTIC_FEEDBACK_MAP = {
  error: 'notificationError' as const,
  warning: 'notificationWarning' as const,
  info: 'light' as const,
  success: 'notificationSuccess' as const,
  validation: 'notificationWarning' as const,
};

export const ACCESSIBILITY_LABELS = {
  error: 'Error message',
  warning: 'Warning message',
  info: 'Information message',
  success: 'Success message',
  validation: 'Validation error message',
  dismiss: 'Dismiss message',
  action: 'Perform action',
};

export const ANIMATION_PRESETS = {
  slideDown: {
    in: {
      from: { translateY: -100, opacity: 0 },
      to: { translateY: 0, opacity: 1 },
    },
    out: {
      from: { translateY: 0, opacity: 1 },
      to: { translateY: -100, opacity: 0 },
    },
  },
  slideUp: {
    in: {
      from: { translateY: 100, opacity: 0 },
      to: { translateY: 0, opacity: 1 },
    },
    out: {
      from: { translateY: 0, opacity: 1 },
      to: { translateY: 100, opacity: 0 },
    },
  },
  fadeScale: {
    in: {
      from: { scale: 0.8, opacity: 0 },
      to: { scale: 1, opacity: 1 },
    },
    out: {
      from: { scale: 1, opacity: 1 },
      to: { scale: 0.8, opacity: 0 },
    },
  },
  bounce: {
    in: {
      from: { scale: 0, opacity: 0 },
      to: { scale: 1, opacity: 1 },
    },
    out: {
      from: { scale: 1, opacity: 1 },
      to: { scale: 0, opacity: 0 },
    },
  },
};
