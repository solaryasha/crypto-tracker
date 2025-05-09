const DEFAULT_RETRY_COUNT = 3;
const BASE_DELAY = 1000; // 1 second

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = DEFAULT_RETRY_COUNT,
    baseDelay = BASE_DELAY,
    onRetry
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Exponential backoff with some randomization
      const delay = baseDelay * Math.pow(2, attempt) * (0.5 + Math.random());
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}