
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Bug, Brain } from 'lucide-react';
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
          <Card className="w-full max-w-4xl">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <CardTitle className="text-red-600">Autonomous AI Error Recovery</CardTitle>
              </div>
              <CardDescription>
                Triple-AI system (GPT-4o + Claude-4 + Gemini 2.5 Pro) analyzing error...
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

              {/* AI Analysis Progress */}
              {this.state.isAnalyzing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-blue-600 animate-pulse" />
                    <p className="text-blue-800 font-medium">
                      Triple-AI Analysis in progress (GPT-4o + Claude-4 + Gemini 2.5 Pro)...
                    </p>
                  </div>
                </div>
              )}

              {/* Build Confidence Check */}
              {this.state.isCheckingConfidence && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Bug className="w-4 h-4 text-purple-600 animate-pulse" />
                    <p className="text-purple-800 font-medium">
                      Running Build Confidence Check (90% threshold)...
                    </p>
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
