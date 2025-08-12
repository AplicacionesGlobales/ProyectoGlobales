import { logger } from '@/utils/logger';
import { ErrorUtils } from '@/utils/errorUtils';

export class ErrorBoundaryService {
  private static instance: ErrorBoundaryService;
  private errorHandlers: Set<(error: Error, errorInfo?: any) => void> = new Set();

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorBoundaryService {
    if (!ErrorBoundaryService.instance) {
      ErrorBoundaryService.instance = new ErrorBoundaryService();
    }
    return ErrorBoundaryService.instance;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled JavaScript errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.handleGlobalError(event.error || new Error(event.message), {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          type: 'javascript-error'
        });
      });

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.handleGlobalError(
          event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
          { type: 'unhandled-promise-rejection' }
        );
      });
    }
  }

  private handleGlobalError(error: Error, context?: any): void {
    logger.critical('Unhandled error caught by global handler', context, error);
    
    // Notify all registered error handlers
    this.errorHandlers.forEach(handler => {
      try {
        handler(error, context);
      } catch (handlerError) {
        logger.error('Error in error handler', { handlerError });
      }
    });
  }

  addErrorHandler(handler: (error: Error, errorInfo?: any) => void): void {
    this.errorHandlers.add(handler);
  }

  removeErrorHandler(handler: (error: Error, errorInfo?: any) => void): void {
    this.errorHandlers.delete(handler);
  }

  // Manual error reporting
  reportError(error: Error, context?: Record<string, any>): void {
    this.handleGlobalError(error, { ...context, type: 'manual-report' });
  }
}

// Export singleton
export const errorBoundaryService = ErrorBoundaryService.getInstance();
