
import type { ErrorData } from './types';

export const setupGlobalErrorHandlers = (handleError: (errorData: ErrorData) => Promise<void>) => {
  // Global JavaScript error handler
  window.addEventListener('error', (event) => {
    handleError({
      type: 'javascript_error',
      message: event.error?.message || event.message || 'Unknown JavaScript error',
      stack: event.error?.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    handleError({
      type: 'unhandled_promise_rejection',
      message: event.reason?.message || String(event.reason) || 'Unhandled promise rejection',
      stack: event.reason?.stack
    });
  });

  // React error boundary fallback
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('React') || message.includes('component')) {
      handleError({
        type: 'react_error',
        message: message,
        context: { args }
      });
    }
    originalConsoleError.apply(console, args);
  };
};
