import { ErrorType, ErrorSeverity } from '@/types/error.types';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, any>;
  errorType?: ErrorType;
  severity?: ErrorSeverity;
  userId?: string;
  sessionId?: string;
}

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private currentLogLevel: LogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.WARN;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLogLevel;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    errorType?: ErrorType,
    severity?: ErrorSeverity
  ): LogEntry {
    return {
      level,
      message,
      timestamp: Date.now(),
      context,
      errorType,
      severity,
      // You can set these from your auth context if available
      userId: undefined,
      sessionId: undefined,
    };
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (__DEV__) {
      this.consoleOutput(entry);
    }
  }

  private consoleOutput(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] ${LogLevel[entry.level]}:`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.context || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.context || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.context || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(prefix, entry.message, entry.context || '');
        break;
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.addLog(entry);
  }

  info(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.addLog(entry);
  }

  warn(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry = this.createLogEntry(LogLevel.WARN, message, context, 'warning', 'medium');
    this.addLog(entry);
  }

  error(message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const logContext = {
      ...context,
      ...(error && {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
      }),
    };
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, logContext, 'error', 'high');
    this.addLog(entry);
  }

  critical(message: string, context?: Record<string, any>, error?: Error): void {
    const logContext = {
      ...context,
      ...(error && {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
      }),
    };
    
    const entry = this.createLogEntry(LogLevel.CRITICAL, message, logContext, 'error', 'critical');
    this.addLog(entry);

    // In production, you might want to send critical errors immediately
    if (!__DEV__) {
      this.sendToRemoteService([entry]);
    }
  }

  // Log API errors specifically
  apiError(endpoint: string, method: string, status?: number, error?: any): void {
    const context = {
      endpoint,
      method,
      status,
      error: typeof error === 'object' ? JSON.stringify(error) : error,
    };
    
    const severity = status && status >= 500 ? 'critical' : 'high';
    this.error(`API Error: ${method} ${endpoint}`, context);
  }

  // Log user actions for analytics
  userAction(action: string, context?: Record<string, any>): void {
    this.info(`User Action: ${action}`, context);
  }

  // Get recent logs (for debugging or sending to support)
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Clear logs (useful for memory management)
  clearLogs(): void {
    this.logs = [];
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Send logs to remote service (implement based on your backend)
  private async sendToRemoteService(logs: LogEntry[]): Promise<void> {
    try {
      // Implement your logging service API call here
      // Example:
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ logs }),
      // });
    } catch (error) {
      console.error('Failed to send logs to remote service:', error);
    }
  }

  // Batch send logs (call this periodically or on app background)
  async flushLogs(): Promise<void> {
    if (this.logs.length === 0) return;
    
    const logsToSend = [...this.logs];
    await this.sendToRemoteService(logsToSend);
    this.clearLogs();
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
