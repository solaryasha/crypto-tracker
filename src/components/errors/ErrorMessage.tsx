import { AppError } from '@/services/errorHandling';

interface ErrorMessageProps {
  error: AppError;
  onRetry?: () => void;
}

export const ErrorMessage = ({ error, onRetry }: ErrorMessageProps) => {
  const isBlocking = error.severity === 'major';

  return (
    <div className={`rounded-md ${isBlocking ? 'bg-red-50' : 'bg-yellow-50'} p-4`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {isBlocking ? (
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${isBlocking ? 'text-red-800' : 'text-yellow-800'}`}>
            {error.userMessage}
          </h3>
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                  isBlocking
                    ? 'text-red-700 bg-red-100 hover:bg-red-200'
                    : 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isBlocking ? 'focus:ring-red-500' : 'focus:ring-yellow-500'
                }`}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};