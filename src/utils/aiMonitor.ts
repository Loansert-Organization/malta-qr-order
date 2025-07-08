interface AIError {
  id: string;
  timestamp: string;
  component: string;
  error: string;
  context?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

class AIMonitor {
  private errors: AIError[] = [];
  private maxErrors = 100;

  logError(component: string, error: Error, context?: Record<string, unknown>) {
    const aiError: AIError = {
      id: `ai-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      component,
      error: error.message,
      context,
      severity: this.determineSeverity(error),
      resolved: false
    };

    this.errors.unshift(aiError);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[AI Monitor] ${component}:`, error, context);
    }

    // In production, you might want to send to an external service
    this.reportToService(aiError);
  }

  private determineSeverity(error: Error): AIError['severity'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'medium';
    }
    
    if (message.includes('ai') || message.includes('openai') || message.includes('gpt')) {
      return 'high';
    }
    
    if (message.includes('payment') || message.includes('stripe')) {
      return 'critical';
    }
    
    return 'low';
  }

  private async reportToService(error: AIError) {
    try {
      // In a real implementation, you'd send to your monitoring service
      // For now, we'll just store it locally
      const existingErrors = JSON.parse(localStorage.getItem('ai-errors') || '[]');
      existingErrors.unshift(error);
      localStorage.setItem('ai-errors', JSON.stringify(existingErrors.slice(0, 50)));
    } catch (e) {
      console.warn('Failed to store AI error:', e);
    }
  }

  getErrors(): AIError[] {
    return [...this.errors];
  }

  getErrorsByComponent(component: string): AIError[] {
    return this.errors.filter(error => error.component === component);
  }

  markResolved(errorId: string) {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }

  clearErrors() {
    this.errors = [];
    localStorage.removeItem('ai-errors');
  }

  getStats() {
    const total = this.errors.length;
    const resolved = this.errors.filter(e => e.resolved).length;
    const bySeverity = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      resolved,
      unresolved: total - resolved,
      bySeverity
    };
  }
}

// Global instance
export const aiMonitor = new AIMonitor();

// Convenience function for components
export const logAIError = (component: string, error: Error, context?: Record<string, unknown>) => {
  aiMonitor.logError(component, error, context);
};

// React error boundary helper
export const handleComponentError = (error: Error, errorInfo: Record<string, unknown>, componentName: string) => {
  logAIError(componentName, error, { errorInfo });
};

// Add global error handling setup function
export const setupGlobalAIErrorHandling = () => {
  // Set up global error handlers
  window.addEventListener('error', (event) => {
    logAIError('Global', new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logAIError('Promise', new Error(event.reason), {
      type: 'unhandledrejection'
    });
  });

  console.log('AI error monitoring initialized');
};
