
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { aiAssistantService } from '@/services/aiAssistantService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  aiAnalysis: any | null;
  isAnalyzing: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    aiAnalysis: null,
    isAnalyzing: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null,
      aiAnalysis: null,
      isAnalyzing: false
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      isAnalyzing: true
    });

    // Call AI Error Handler for analysis
    this.analyzeErrorWithAI(error, errorInfo);
  }

  private async analyzeErrorWithAI(error: Error, errorInfo: ErrorInfo) {
    try {
      const errorData = aiAssistantService.captureErrorContext(error, {
        code_context: errorInfo.componentStack,
        user_action: 'Component rendering/interaction'
      });

      const analysis = await aiAssistantService.analyzeError(errorData);
      
      this.setState({
        aiAnalysis: analysis,
        isAnalyzing: false
      });
    } catch (analysisError) {
      console.error('Failed to analyze error with AI:', analysisError);
      this.setState({ isAnalyzing: false });
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      aiAnalysis: null,
      isAnalyzing: false
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <CardTitle className="text-red-600">Something went wrong</CardTitle>
              </div>
              <CardDescription>
                An unexpected error occurred. Our AI is analyzing the issue...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Message */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Error Details</h3>
                <p className="text-red-700 text-sm font-mono">
                  {this.state.error?.message || 'Unknown error'}
                </p>
              </div>

              {/* AI Analysis */}
              {this.state.isAnalyzing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Bug className="w-4 h-4 text-blue-600 animate-pulse" />
                    <p className="text-blue-800 font-medium">AI analyzing error...</p>
                  </div>
                </div>
              )}

              {this.state.aiAnalysis && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">🤖 AI Analysis</h3>
                  <div className="space-y-2">
                    <p className="text-green-700">
                      <span className="font-medium">Error Type:</span> {this.state.aiAnalysis.error_type}
                    </p>
                    <p className="text-green-700">
                      <span className="font-medium">Severity:</span> {this.state.aiAnalysis.severity}
                    </p>
                    <p className="text-green-700">
                      <span className="font-medium">Root Cause:</span> {this.state.aiAnalysis.root_cause}
                    </p>
                    {this.state.aiAnalysis.suggested_fixes?.length > 0 && (
                      <div>
                        <p className="font-medium text-green-800">Suggested Fixes:</p>
                        <ul className="list-disc list-inside text-green-700 text-sm mt-1">
                          {this.state.aiAnalysis.suggested_fixes.map((fix: any, index: number) => (
                            <li key={index}>{fix.fix_description}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Development Info */}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <summary className="font-semibold text-gray-800 cursor-pointer">
                    Development Details
                  </summary>
                  <pre className="text-xs text-gray-600 mt-2 overflow-auto">
                    {this.state.error?.stack}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button onClick={this.handleReset} variant="outline">
                  Try Again
                </Button>
                <Button onClick={this.handleReload} className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Reload Page</span>
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

export default ErrorBoundary;
