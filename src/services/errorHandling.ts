export type ErrorSeverity = 'minor' | 'major';
export type ErrorCategory = 'api' | 'network' | 'validation' | 'unknown' | 'timeout';

export interface AppError {
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: Date;
  isBlocking: boolean;
  statusCode?: number;
}

export class ErrorHandler {
  static createError(
    error: Error | string,
    category: ErrorCategory = 'unknown',
    severity: ErrorSeverity = 'minor',
    statusCode?: number
  ): AppError {
    const message = error instanceof Error ? error.message : error;
    return {
      message,
      userMessage: this.translateErrorToUserMessage(message, category, statusCode),
      severity,
      category,
      timestamp: new Date(),
      isBlocking: severity === 'major',
      statusCode
    };
  }

  private static translateErrorToUserMessage(
    message: string,
    category: ErrorCategory,
    statusCode?: number,
  ): string {
    // API specific errors
    if (category === 'api') {
      if (statusCode === 429 || message.includes('429')) {
        return "We're experiencing high traffic. Please try again in a moment.";
      }
      if (statusCode === 404 || message.includes('404')) {
        return 'The requested cryptocurrency information could not be found.';
      }
      return 'Unable to fetch cryptocurrency data. Please try again later.';
    }

    // Network errors
    if (category === 'network') {
      if (message.includes('timeout')) {
        return 'The request timed out. Please check your connection and try again.';
      }
      if (message.includes('offline')) {
        return 'You appear to be offline. Please check your internet connection.';
      }
      return 'Please check your internet connection and try again.';
    }

    // Timeout specific errors
    if (category === 'timeout') {
      return 'The request took too long to complete. Please try again.';
    }

    // Validation errors
    if (category === 'validation') {
      return 'The requested operation could not be completed. Please check your input.';
    }

    // Default/unknown errors
    return 'An unexpected error occurred. Please try again later.';
  }
}