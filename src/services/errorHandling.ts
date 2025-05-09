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
  retryCount?: number;
}

export class ErrorHandler {
  static createError(
    error: Error | string,
    category: ErrorCategory = 'unknown',
    severity: ErrorSeverity = 'minor',
    statusCode?: number,
    retryCount?: number
  ): AppError {
    const message = error instanceof Error ? error.message : error;
    return {
      message,
      userMessage: this.translateErrorToUserMessage(message, category, retryCount),
      severity,
      category,
      timestamp: new Date(),
      isBlocking: severity === 'major',
      retryCount,
      statusCode
    };
  }

  private static translateErrorToUserMessage(
    message: string,
    category: ErrorCategory,
    retryCount?: number
  ): string {
    // API specific errors
    if (category === 'api') {
      if (message.includes('429')) {
        return 'We\'re experiencing high traffic. Please try again in a moment.';
      }
      if (message.includes('404')) {
        return 'The requested cryptocurrency information could not be found.';
      }
      if (retryCount !== undefined) {
        return `Unable to fetch cryptocurrency data. Retrying... (Attempt ${retryCount})`;
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
      if (retryCount !== undefined) {
        return `Connection issues detected. Retrying... (Attempt ${retryCount})`;
      }
      return 'Please check your internet connection and try again.';
    }

    // Timeout specific errors
    if (category === 'timeout') {
      if (retryCount !== undefined) {
        return `Request timed out. Retrying... (Attempt ${retryCount})`;
      }
      return 'The request took too long to complete. Please try again.';
    }

    // Validation errors
    if (category === 'validation') {
      return 'The requested operation could not be completed. Please check your input.';
    }

    // Default/unknown errors
    if (retryCount !== undefined) {
      return `An error occurred. Retrying... (Attempt ${retryCount})`;
    }
    return 'An unexpected error occurred. Please try again later.';
  }
}