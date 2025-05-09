export type ErrorSeverity = 'minor' | 'major';
export type ErrorCategory = 'api' | 'network' | 'validation' | 'unknown';

export interface AppError {
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: Date;
  isBlocking: boolean;
}

export class ErrorHandler {
  static createError(
    error: Error | string,
    category: ErrorCategory = 'unknown',
    severity: ErrorSeverity = 'minor'
  ): AppError {
    const message = error instanceof Error ? error.message : error;
    return {
      message,
      userMessage: this.translateErrorToUserMessage(message, category),
      severity,
      category,
      timestamp: new Date(),
      isBlocking: severity === 'major',
    };
  }

  private static translateErrorToUserMessage(
    message: string,
    category: ErrorCategory
  ): string {
    // API specific errors
    if (category === 'api') {
      if (message.includes('429')) {
        return 'We\'re experiencing high traffic. Please try again in a moment.';
      }
      if (message.includes('404')) {
        return 'The requested cryptocurrency information could not be found.';
      }
      return 'Unable to fetch cryptocurrency data. Please try again later.';
    }

    // Network errors
    if (category === 'network') {
      return 'Please check your internet connection and try again.';
    }

    // Validation errors
    if (category === 'validation') {
      return 'The requested operation could not be completed. Please check your input.';
    }

    // Default/unknown errors
    return 'An unexpected error occurred. Please try again later.';
  }
}