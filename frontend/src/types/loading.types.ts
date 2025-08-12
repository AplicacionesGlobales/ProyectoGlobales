export type LoadingSize = 'small' | 'large';

export type LoadingVariant = 'spinner' | 'inline' | 'overlay' | 'screen';

export interface BaseLoadingProps {
  loading?: boolean;
  message?: string;
  className?: string;
}

export interface LoadingSpinnerProps extends BaseLoadingProps {
  size?: LoadingSize;
  color?: string;
}

export interface LoadingScreenProps extends BaseLoadingProps {
  backgroundColor?: string;
  spinnerColor?: string;
  textColor?: string;
}

export interface LoadingOverlayProps extends BaseLoadingProps {
  visible: boolean;
  backgroundColor?: string;
  overlayColor?: string;
  spinnerColor?: string;
  textColor?: string;
  transparent?: boolean;
}

export interface LoadingStateProps extends BaseLoadingProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  variant?: LoadingVariant;
  size?: LoadingSize;
  color?: string;
}

export interface UseLoadingOptions {
  initialLoading?: boolean;
}

export interface UseLoadingReturn {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}
