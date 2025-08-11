import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useError } from '@/contexts/ErrorContext';
import { ToastError } from './ToastError';
import { BannerError } from './BannerError';
import { ModalError } from './ModalError';

/**
 * ErrorContainer component that renders all active errors from the ErrorContext
 * This should be placed at the root level of your app to display global errors
 */
export const ErrorContainer: React.FC = () => {
  const { toastErrors, bannerError, modalError, hideToast, hideBanner, hideModal } = useError();

  return (
    <>
      {/* Toast Errors */}
      {toastErrors.map((toast) => (
        <ToastError
          key={toast.id}
          message={toast.message}
          type={toast.type}
          severity={toast.severity}
          visible={toast.isVisible}
          position={toast.position}
          actionText={toast.actionLabel}
          onActionPress={toast.action}
          onDismiss={() => hideToast(toast.id)}
          autoHide={true}
          autoHideDuration={toast.duration}
          testID={`toast-error-${toast.id}`}
        />
      ))}

      {/* Banner Error */}
      {bannerError && (
        <BannerError
          message={bannerError.message}
          type={bannerError.type}
          severity={bannerError.severity}
          visible={bannerError.isVisible}
          dismissible={bannerError.isDismissible}
          actions={bannerError.action && bannerError.actionLabel ? [
            {
              text: bannerError.actionLabel,
              onPress: bannerError.action,
              primary: true,
            }
          ] : undefined}
          onDismiss={hideBanner}
          testID="banner-error"
        />
      )}

      {/* Modal Error */}
      {modalError && (
        <ModalError
          title={modalError.title}
          message={modalError.message}
          type={modalError.type}
          severity={modalError.severity}
          visible={modalError.isVisible}
          dismissible={modalError.isDismissible}
          buttons={[
            ...(modalError.secondaryAction && modalError.secondaryActionLabel ? [{
              text: modalError.secondaryActionLabel,
              onPress: modalError.secondaryAction,
              style: 'cancel' as const,
            }] : []),
            {
              text: modalError.primaryActionLabel || 'OK',
              onPress: modalError.primaryAction || hideModal,
              style: 'default' as const,
            },
          ]}
          onDismiss={hideModal}
          testID="modal-error"
        />
      )}
    </>
  );
};

/**
 * ErrorBoundary component to catch and display JavaScript errors
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error) => React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Here you could send error to a logging service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }

      return (
        <View style={styles.errorBoundaryContainer}>
          <ModalError
            title="Something went wrong"
            message="An unexpected error occurred. Please restart the app."
            type="error"
            severity="critical"
            visible={true}
            dismissible={false}
            buttons={[
              {
                text: 'Restart App',
                onPress: () => {
                  this.setState({ hasError: false, error: undefined });
                },
                style: 'default',
              },
            ]}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorBoundaryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
