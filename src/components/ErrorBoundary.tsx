import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Bug, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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
  buildConfidence: any | null;
  isCheckingConfidence: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    aiAnalysis: null,
    isAnalyzing: false,
    buildConfidence: null,
    isCheckingConfidence: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      errorInfo: null,
      aiAnalysis: null,
      isAnalyzing: false,
      buildConfidence: null,
      isCheckingConfidence: false
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary - Autonomous AI Error Analysis Triggered:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      isAnalyzing: true,
      isCheckingConfidence: true
    });

    // Autonomous AI QA Protocol - Triple AI Error Analysis
    this.runAutonomousAIProtocol(error, errorInfo);
  }

  private async runAutonomousAIProtocol(error: Error, errorInfo: ErrorInfo) {
    try {
      console.log('🤖 Starting Autonomous AI QA Protocol...');

      // Step 1: Triple-AI Error Analysis (GPT-4o + Claude-4 + Gemini 2.5 Pro)
      const errorData = aiAssistantService.captureErrorContext(error, {
        code_context: errorInfo.componentStack,
        user_action: 'Component rendering/interaction'
      });

      const aiErrorAnalysis = await aiAssistantService.analyzeError(errorData);
      
      this.setState({
        aiAnalysis: aiErrorAnalysis,
        isAnalyzing: false
      });

      // Step 2: Build Confidence Check (90% threshold requirement)
      const buildConfidenceCheck = await aiAssistantService.checkBuildConfidence({
        task_description: 'Error recovery and system stability check',
        files_modified: ['ErrorBoundary', 'Application State'],
        error_logs: [error.message],
        ui_screens: ['Error Recovery Screen']
      });

      this.setState({
        buildConfidence: buildConfidenceCheck,
        isCheckingConfidence: false
      });

      // Step 3: Autonomous Recovery Attempt (if confidence is high enough)
      if (buildConfidenceCheck?.meets_90_percent_threshold) {
        console.log('✅ AI Confidence ≥90% - Attempting autonomous recovery...');
        // Could implement automatic error recovery here
      } else {
        console.log('⚠️ AI Confidence <90% - Manual intervention recommended');
      }

    } catch (analysisError) {
      console.error('❌ Autonomous AI Protocol failed:', analysisError);
      this.setState({ 
        isAnalyzing: false,
        isCheckingConfidence: false
      });
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
      isAnalyzing: false,
      buildConfidence: null,
      isCheckingConfidence: false
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <CardTitle className="text-2xl text-red-600">System Error Detected</CardTitle>
              </div>
              <CardDescription className="text-lg">
                AI-powered error recovery system is analyzing the issue...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enhanced Error Message Display */}
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                  <Bug className="h-4 w-4 mr-2" />
                  Error Details
                </h3>
                <code className="text-red-700 text-sm bg-red-100 p-2 rounded block">
                  {this.state.error?.message || 'Unknown error occurred'}
                </code>
              </div>

              {/* Enhanced AI Analysis Progress */}
              {this.state.isAnalyzing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <LoadingSpinner size="sm" className="text-blue-600" />
                    <div>
                      <p className="text-blue-800 font-medium">
                        Triple-AI Analysis in Progress
                      </p>
                      <p className="text-blue-600 text-sm">
                        GPT-4o + Claude-4 + Gemini 2.5 Pro analyzing error patterns...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Build Confidence Check */}
              {this.state.isCheckingConfidence && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <LoadingSpinner size="sm" className="text-purple-600" />
                    <div>
                      <p className="text-purple-800 font-medium">
                        Build Confidence Assessment
                      </p>
                      <p className="text-purple-600 text-sm">
                        Checking system stability (90% threshold required)...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Analysis Results */}
              {this.state.aiAnalysis && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">🤖 Triple-AI Analysis Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                    <div className="space-y-2">
                      <p className="text-green-700">
                        <span className="font-medium">AI Confidence:</span> {this.state.aiAnalysis.ai_consensus?.overall_confidence}%
                      </p>
                      <p className="text-green-700">
                        <span className="font-medium">Models Used:</span> {this.state.aiAnalysis.ai_model_used}
                      </p>
                    </div>
                  </div>
                  
                  {this.state.aiAnalysis.suggested_fixes?.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium text-green-800">AI-Generated Solutions:</p>
                      <ul className="list-disc list-inside text-green-700 text-sm mt-1 space-y-1">
                        {this.state.aiAnalysis.suggested_fixes.map((fix: any, index: number) => (
                          <li key={index}>{fix.fix_description}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Build Confidence Results */}
              {this.state.buildConfidence && (
                <div className={`border rounded-lg p-4 ${
                  this.state.buildConfidence.meets_90_percent_threshold 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <h3 className={`font-semibold mb-2 ${
                    this.state.buildConfidence.meets_90_percent_threshold 
                      ? 'text-green-800' 
                      : 'text-yellow-800'
                  }`}>
                    🏆 Build Confidence Assessment
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-sm font-medium">Overall</p>
                      <p className="text-2xl font-bold">{this.state.buildConfidence.overall_confidence}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Code Quality</p>
                      <p className="text-xl">{this.state.buildConfidence.code_quality_score}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Error Free</p>
                      <p className="text-xl">{this.state.buildConfidence.error_free_score}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">UX Quality</p>
                      <p className="text-xl">{this.state.buildConfidence.ux_quality_score}%</p>
                    </div>
                  </div>
                  {this.state.buildConfidence.recommendations?.length > 0 && (
                    <div>
                      <p className="font-medium mb-1">AI Recommendations:</p>
                      <ul className="text-sm space-y-1">
                        {this.state.buildConfidence.recommendations.map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                <Button 
                  onClick={this.handleReset} 
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={this.handleReload} 
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Application
                </Button>
              </div>

              {/* Enhanced Development Info */}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                  <summary className="font-semibold text-gray-800 cursor-pointer hover:text-gray-600">
                    Development Debug Information
                  </summary>
                  <pre className="text-xs text-gray-600 mt-3 overflow-auto p-2 bg-gray-100 rounded">
                    {this.state.error?.stack}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
