
import React, { Component, ReactNode } from 'react';
import { AIGuard } from '@/lib/ai-guards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  private errorTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
      errorInfo
    });

    // Log to AI system with additional context
    AIGuard.handleComponentError(error, this.props.componentName || 'ErrorBoundary');
    
    // Log additional context for debugging
    console.group(`🔴 Error Boundary Caught Error (${this.props.componentName})`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Auto-recovery attempt after 5 seconds for certain error types
    if (this.isRecoverableError(error)) {
      this.errorTimeout = setTimeout(() => {
        console.log('🔄 Attempting auto-recovery...');
        this.handleRetry();
      }, 5000);
    }
  }

  componentWillUnmount() {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
  }

  private isRecoverableError(error: Error): boolean {
    const recoverablePatterns = [
      'ChunkLoadError',
      'Loading chunk',
      'Network error',
      'fetch'
    ];
    
    return recoverablePatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  handleReload = () => {
    // Clear any pending timeouts
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
    
    console.log('🔄 User initiated page reload');
    window.location.reload();
  };

  handleRetry = () => {
    console.log('🔄 User initiated retry');
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: ''
    });
    
    // Clear any pending timeouts
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isNetworkError = this.state.error?.message.toLowerCase().includes('fetch') ||
                            this.state.error?.message.toLowerCase().includes('network');

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-800">
                <AlertCircle className="mr-2 h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-red-700">
                <p className="font-medium">
                  An error occurred in {this.props.componentName || 'the application'}
                </p>
                {isNetworkError && (
                  <p className="text-sm mt-2">
                    This appears to be a network issue. Please check your connection and try again.
                  </p>
                )}
                <p className="text-sm mt-2">
                  Error ID: <code className="bg-red-100 px-1 rounded">{this.state.errorId}</code>
                </p>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-red-100 p-3 rounded text-sm">
                  <summary className="cursor-pointer font-medium">Error Details (Development)</summary>
                  <pre className="mt-2 whitespace-pre-wrap text-xs overflow-auto max-h-40">
                    {this.state.error.message}
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo?.componentStack && (
                    <div className="mt-2">
                      <strong>Component Stack:</strong>
                      <pre className="text-xs mt-1 overflow-auto max-h-20">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </details>
              )}

              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <Button onClick={this.handleRetry} variant="outline" size="sm" className="flex-1">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  <Button onClick={this.handleReload} size="sm" className="flex-1">
                    Reload Page
                  </Button>
                </div>
                <Button onClick={this.handleGoHome} variant="ghost" size="sm" className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simplified HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary componentName={componentName}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default ErrorBoundary;
