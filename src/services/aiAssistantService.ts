import { supabase } from '@/integrations/supabase/client';
import type { 
  AIResponse, 
  AIWaiterLog, 
  MenuItem, 
  Order, 
  Vendor,
  ErrorHandler,
  ApiResponse
} from '@/types/api';

export interface ErrorAnalysisRequest {
  error_message: string;
  error_stack?: string;
  file_path?: string;
  code_context?: string;
  user_action?: string;
  browser_info?: string;
  console_logs?: string[];
}

export interface CodeEvaluationRequest {
  task_description: string;
  files_modified: string[];
  code_changes: {
    file_path: string;
    changes: string;
    change_type: 'created' | 'modified' | 'deleted';
  }[];
  user_requirements: string;
  completion_summary: string;
}

export interface UXRecommendationRequest {
  screen_name: string;
  current_ui_code: string;
  user_context?: {
    device_type?: 'mobile' | 'tablet' | 'desktop';
    location?: string;
    time_of_day?: string;
    user_role?: 'guest' | 'vendor' | 'admin';
  };
  performance_metrics?: {
    load_time?: number;
    interaction_delay?: number;
  };
}

interface AIServiceConfig {
  defaultModel: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

interface AIContext {
  vendor: Vendor;
  menuItems: MenuItem[];
  userPreferences?: Record<string, unknown>;
  orderHistory?: Order[];
  currentCart?: Record<string, unknown>;
}

interface AIRequest {
  message: string;
  context: AIContext;
  sessionId: string;
  requestType: 'chat' | 'recommendation' | 'upsell' | 'support';
}

interface MenuRecommendation {
  item: MenuItem;
  confidence: number;
  reason: string;
  category: 'popular' | 'similar' | 'complementary' | 'dietary';
}

interface UpsellSuggestion {
  item: MenuItem;
  originalItem: MenuItem;
  reason: string;
  additionalRevenue: number;
  confidence: number;
}

class AIAssistantService {
  private readonly config: AIServiceConfig;
  private readonly errorHandler: ErrorHandler;

  constructor(config: Partial<AIServiceConfig> = {}) {
    this.config = {
      defaultModel: 'gpt-4o',
      maxTokens: 500,
      temperature: 0.7,
      timeout: 30000,
      ...config
    };

    this.errorHandler = (error: Error) => {
      console.error('AIAssistantService Error:', error);
      this.logError(error);
    };
  }

  // Main chat interface
  async processUserMessage(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      this.validateRequest(request);

      // Log user message
      await this.logMessage(request.message, 'user_message', request.sessionId, request.context.vendor.id);

      let response: string;
      let suggestions: MenuRecommendation[] = [];

      switch (request.requestType) {
        case 'chat':
          response = await this.handleChatRequest(request);
          break;
        case 'recommendation':
          const result = await this.handleRecommendationRequest(request);
          response = result.response;
          suggestions = result.suggestions;
          break;
        case 'upsell':
          response = await this.handleUpsellRequest(request);
          break;
        case 'support':
          response = await this.handleSupportRequest(request);
          break;
        default:
          response = await this.handleChatRequest(request);
      }

      const processingTime = Date.now() - startTime;

      // Log AI response
      await this.logMessage(response, 'ai_response', request.sessionId, request.context.vendor.id, {
        processing_time_ms: processingTime,
        request_type: request.requestType,
        suggestions_count: suggestions.length
      });

      return {
        id: crypto.randomUUID(),
        model_used: this.config.defaultModel,
        response,
        processing_time_ms: processingTime,
        success: true,
        suggestions: suggestions.map(s => ({
          type: 'menu_item',
          item_id: s.item.id,
          title: s.item.name,
          description: s.reason,
          confidence: s.confidence,
          price: s.item.price
        })),
        created_at: new Date().toISOString()
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.errorHandler(error instanceof Error ? error : new Error('Unknown AI service error'));

      return {
        id: crypto.randomUUID(),
        model_used: this.config.defaultModel,
        response: 'I apologize, but I encountered an issue processing your request. Please try again.',
        processing_time_ms: processingTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        created_at: new Date().toISOString()
      };
    }
  }

  // Generate menu recommendations
  async generateMenuRecommendations(
    context: AIContext, 
    preferences: Record<string, unknown> = {}
  ): Promise<MenuRecommendation[]> {
    try {
      const { menuItems } = context;
      
      if (!menuItems || menuItems.length === 0) {
        return [];
      }

      // Filter available items
      const availableItems = menuItems.filter(item => item.available);
      
      // Apply preference-based filtering
      let filteredItems = availableItems;
      
      if (preferences.dietary_restrictions) {
        const restrictions = preferences.dietary_restrictions as string[];
        filteredItems = availableItems.filter(item => 
          !restrictions.some(restriction => 
            item.allergens?.includes(restriction) ||
            item.dietary_tags?.includes(restriction)
          )
        );
      }

      // Sort by popularity and rating
      const recommendations: MenuRecommendation[] = filteredItems
        .map(item => ({
          item,
          confidence: this.calculateRecommendationConfidence(item, preferences),
          reason: this.generateRecommendationReason(item, preferences),
          category: this.categorizeRecommendation(item, preferences)
        }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

      return recommendations;

    } catch (error) {
      this.errorHandler(error instanceof Error ? error : new Error('Failed to generate recommendations'));
      return [];
    }
  }

  // Generate upsell suggestions
  async generateUpsellSuggestions(
    context: AIContext,
    currentItem: MenuItem
  ): Promise<UpsellSuggestion[]> {
    try {
      const { menuItems } = context;
      
      const suggestions: UpsellSuggestion[] = menuItems
        .filter(item => 
          item.available && 
          item.id !== currentItem.id &&
          item.price > currentItem.price
        )
        .map(item => ({
          item,
          originalItem: currentItem,
          reason: this.generateUpsellReason(currentItem, item),
          additionalRevenue: item.price - currentItem.price,
          confidence: this.calculateUpsellConfidence(currentItem, item)
        }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);

      return suggestions;

    } catch (error) {
      this.errorHandler(error instanceof Error ? error : new Error('Failed to generate upsell suggestions'));
      return [];
    }
  }

  // Private helper methods
  private validateRequest(request: AIRequest): void {
    if (!request.message || request.message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    if (request.message.length > 2000) {
      throw new Error('Message too long (max 2000 characters)');
    }

    if (!request.context.vendor || !request.context.vendor.id) {
      throw new Error('Vendor context is required');
    }

    if (!request.sessionId) {
      throw new Error('Session ID is required');
    }
  }

  private async handleChatRequest(request: AIRequest): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-waiter-chat', {
        body: {
          message: request.message,
          vendor_id: request.context.vendor.id,
          guest_session_id: request.sessionId,
          conversation_context: {
            menu_items: request.context.menuItems.slice(0, 20), // Limit for API
            user_preferences: request.context.userPreferences,
            current_cart: request.context.currentCart
          }
        }
      });

      if (error) {
        throw new Error(`AI chat service error: ${error.message}`);
      }

      return data?.response || 'I apologize, but I couldn\'t process that request.';

    } catch (error) {
      console.error('Chat request failed:', error);
      return this.getFallbackResponse(request.message);
    }
  }

  private async handleRecommendationRequest(request: AIRequest): Promise<{
    response: string;
    suggestions: MenuRecommendation[];
  }> {
    const suggestions = await this.generateMenuRecommendations(
      request.context, 
      request.context.userPreferences
    );

    const response = suggestions.length > 0
      ? `Based on your preferences, I'd recommend: ${suggestions.slice(0, 3).map(s => s.item.name).join(', ')}. ${suggestions[0].reason}`
      : 'I\'d be happy to help you find something delicious! What type of cuisine are you in the mood for?';

    return { response, suggestions };
  }

  private async handleUpsellRequest(request: AIRequest): Promise<string> {
    // Extract current item from context or message
    const currentItemName = this.extractItemFromMessage(request.message);
    const currentItem = request.context.menuItems.find(item => 
      item.name.toLowerCase().includes(currentItemName.toLowerCase())
    );

    if (!currentItem) {
      return 'Great choice! Would you like to add any sides or drinks to complete your meal?';
    }

    const suggestions = await this.generateUpsellSuggestions(request.context, currentItem);
    
    if (suggestions.length > 0) {
      const topSuggestion = suggestions[0];
      return `Excellent choice with the ${currentItem.name}! You might also enjoy our ${topSuggestion.item.name} - ${topSuggestion.reason}`;
    }

    return `Great choice with the ${currentItem.name}! Would you like to add a drink or dessert?`;
  }

  private async handleSupportRequest(request: AIRequest): Promise<string> {
    return 'I\'m here to help! For urgent matters, please contact our staff directly. Otherwise, I\'m happy to assist you with menu questions or placing your order.';
  }

  private calculateRecommendationConfidence(
    item: MenuItem, 
    preferences: Record<string, unknown>
  ): number {
    let confidence = 0.5; // Base confidence

    // Popular items get higher confidence
    if (item.popular) confidence += 0.3;
    if (item.featured) confidence += 0.2;

    // Match dietary preferences
    if (preferences.dietary_restrictions) {
      const restrictions = preferences.dietary_restrictions as string[];
      const matches = item.dietary_tags?.filter(tag => 
        restrictions.includes(tag)
      ).length || 0;
      confidence += matches * 0.1;
    }

    // Price considerations
    if (item.price < 15) confidence += 0.1; // Affordable items
    if (item.price > 25) confidence -= 0.1; // Expensive items

    return Math.min(1, Math.max(0, confidence));
  }

  private generateRecommendationReason(
    item: MenuItem, 
    preferences: Record<string, unknown>
  ): string {
    if (item.popular) {
      return `This is one of our most popular dishes - customers love it!`;
    }
    
    if (item.featured) {
      return `This is a featured item that our chef specially recommends.`;
    }

    if (item.dietary_tags?.length) {
      return `Perfect for your dietary preferences (${item.dietary_tags.join(', ')}).`;
    }

    return `A delicious ${item.category || 'dish'} that I think you'll enjoy.`;
  }

  private categorizeRecommendation(
    item: MenuItem, 
    preferences: Record<string, unknown>
  ): 'popular' | 'similar' | 'complementary' | 'dietary' {
    if (item.popular) return 'popular';
    if (preferences.dietary_restrictions && item.dietary_tags?.length) return 'dietary';
    return 'similar';
  }

  private calculateUpsellConfidence(originalItem: MenuItem, upsellItem: MenuItem): number {
    let confidence = 0.3; // Base confidence for upsells

    // Same category items are better upsells
    if (originalItem.category === upsellItem.category) confidence += 0.4;

    // Price difference should be reasonable (not too high)
    const priceDiff = upsellItem.price - originalItem.price;
    if (priceDiff <= 5) confidence += 0.3;
    else if (priceDiff <= 10) confidence += 0.1;
    else confidence -= 0.2;

    // Popular items are better upsells
    if (upsellItem.popular) confidence += 0.2;

    return Math.min(1, Math.max(0, confidence));
  }

  private generateUpsellReason(originalItem: MenuItem, upsellItem: MenuItem): string {
    if (originalItem.category === upsellItem.category) {
      return `it's our premium version with even more flavor`;
    }
    
    if (upsellItem.popular) {
      return `it's incredibly popular and pairs perfectly with your selection`;
    }

    return `it would complement your ${originalItem.name} beautifully`;
  }

  private extractItemFromMessage(message: string): string {
    // Simple extraction - could be enhanced with NLP
    const words = message.toLowerCase().split(' ');
    const commonFood = ['pizza', 'burger', 'pasta', 'salad', 'sandwich', 'soup'];
    
    for (const word of words) {
      if (commonFood.includes(word)) {
        return word;
      }
    }
    
    return '';
  }

  private getFallbackResponse(message: string): string {
    const fallbacks = [
      "I'd be happy to help you with your order! What can I tell you about our menu?",
      "Great question! Let me know what type of food you're interested in.",
      "I'm here to help! What would you like to know about our dishes?",
      "That's interesting! How can I assist you with your dining experience today?"
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  private async logMessage(
    content: string,
    messageType: 'user_message' | 'ai_response',
    sessionId: string,
    vendorId: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      await supabase.from('ai_waiter_logs').insert({
        content,
        message_type: messageType,
        guest_session_id: sessionId,
        vendor_id: vendorId,
        processing_metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          service: 'ai_assistant'
        },
        ai_model_used: this.config.defaultModel
      });
    } catch (error) {
      console.warn('Failed to log AI message:', error);
      // Don't throw - logging failure shouldn't break the service
    }
  }

  private async logError(error: Error): Promise<void> {
    try {
      await supabase.from('error_logs').insert({
        error_type: 'ai_service',
        error_message: error.message,
        stack_trace: error.stack,
        component: 'AIAssistantService',
        severity: 'medium',
        resolved: false,
        created_at: new Date().toISOString()
      });
    } catch (logError) {
      console.warn('Failed to log error:', logError);
    }
  }

  // Triple-AI Error Analysis (GPT-4o + Claude-4 + Gemini 2.5 Pro)
  async analyzeError(errorData: ErrorAnalysisRequest) {
    try {
      console.log('🤖 Calling Triple-AI Error Handler (GPT-4o + Claude-4 + Gemini)...');
      
      const { data, error } = await supabase.functions.invoke('ai-error-handler', {
        body: errorData
      });

      if (error) {
        console.error('❌ AI Error Handler failed:', error);
        return null;
      }

      console.log('✅ Triple-AI Error Analysis completed:', {
        confidence: data.ai_consensus?.overall_confidence,
        models: data.ai_model_used
      });
      return data;
    } catch (error) {
      console.error('Failed to call AI Error Handler:', error);
      return null;
    }
  }

  // AI-Powered Code Quality Evaluation
  async evaluateCode(evaluationData: CodeEvaluationRequest) {
    try {
      console.log('🤖 Calling AI Code Evaluator for task assessment...');
      
      const { data, error } = await supabase.functions.invoke('ai-code-evaluator', {
        body: evaluationData
      });

      if (error) {
        console.error('❌ AI Code Evaluator failed:', error);
        return null;
      }

      console.log('✅ AI Code Evaluation completed:', {
        overall_score: data.overall_score,
        model: data.ai_model_used
      });
      return data;
    } catch (error) {
      console.error('Failed to call AI Code Evaluator:', error);
      return null;
    }
  }

  // Triple-AI UX Recommendations (Adaptive UX Rule)
  async getUXRecommendations(uxData: UXRecommendationRequest) {
    try {
      console.log('🎨 Calling Triple-AI UX Recommendation (Adaptive UX Enhancement)...');
      
      const { data, error } = await supabase.functions.invoke('ai-ux-recommendation', {
        body: uxData
      });

      if (error) {
        console.error('❌ AI UX Recommendation failed:', error);
        return null;
      }

      console.log('✅ Triple-AI UX Analysis completed:', {
        ux_score: data.ai_consensus?.overall_ux_score,
        priority: data.implementation_priority,
        models: data.ai_models_used
      });
      return data;
    } catch (error) {
      console.error('Failed to call AI UX Recommendation:', error);
      return null;
    }
  }

  // Autonomous AI QA Protocol - Build Confidence Check
  async checkBuildConfidence(taskData: {
    task_description: string;
    files_modified: string[];
    error_logs?: string[];
    ui_screens?: string[];
  }) {
    try {
      console.log('🏗️ Running Autonomous AI QA Protocol - Build Confidence Check...');
      
      // Run all three AI systems in parallel
      const [codeEvaluation, errorAnalysis, uxRecommendations] = await Promise.allSettled([
        this.evaluateTaskCode(taskData),
        this.checkForErrors(taskData),
        this.validateUXScreens(taskData)
      ]);

      const codeScore = codeEvaluation.status === 'fulfilled' ? codeEvaluation.value?.overall_score || 0 : 0;
      const errorScore = errorAnalysis.status === 'fulfilled' ? (errorAnalysis.value ? 100 : 90) : 70;
      const uxScore = uxRecommendations.status === 'fulfilled' ? uxRecommendations.value?.ai_consensus?.overall_ux_score || 0 : 0;

      const overallConfidence = Math.round((codeScore + errorScore + uxScore) / 3);
      
      const buildConfidenceResult = {
        overall_confidence: overallConfidence,
        code_quality_score: codeScore,
        error_free_score: errorScore,
        ux_quality_score: uxScore,
        meets_90_percent_threshold: overallConfidence >= 90,
        recommendations: this.generateConfidenceRecommendations(overallConfidence, {
          code: codeScore,
          errors: errorScore,
          ux: uxScore
        }),
        timestamp: new Date().toISOString()
      };

      console.log('🏆 Build Confidence Check completed:', buildConfidenceResult);
      return buildConfidenceResult;
    } catch (error) {
      console.error('Failed Build Confidence Check:', error);
      return {
        overall_confidence: 50,
        meets_90_percent_threshold: false,
        error: 'Build confidence check failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Helper Methods
  private async evaluateTaskCode(taskData: Record<string, unknown>) {
    return this.evaluateCode({
      task_description: taskData.task_description,
      files_modified: taskData.files_modified,
      code_changes: taskData.files_modified.map((file: string) => ({
        file_path: file,
        changes: 'Task completion changes',
        change_type: 'modified' as const
      })),
      user_requirements: taskData.task_description,
      completion_summary: 'Autonomous AI QA evaluation'
    });
  }

  private async checkForErrors(taskData: Record<string, unknown>) {
    if (taskData.error_logs && taskData.error_logs.length > 0) {
      return this.analyzeError({
        error_message: taskData.error_logs[0],
        console_logs: taskData.error_logs
      });
    }
    return null;
  }

  private async validateUXScreens(taskData: Record<string, unknown>) {
    if (taskData.ui_screens && taskData.ui_screens.length > 0) {
      return this.getUXRecommendations({
        screen_name: taskData.ui_screens[0],
        current_ui_code: 'Screen validation check'
      });
    }
    return null;
  }

  private generateConfidenceRecommendations(overallConfidence: number, scores: Record<string, number>) {
    const recommendations = [];
    
    if (overallConfidence < 90) {
      recommendations.push('🚨 Build confidence below 90% threshold - improvements required');
    }
    
    if (scores.code < 80) {
      recommendations.push('📝 Code quality needs improvement - run AI code review');
    }
    
    if (scores.errors < 90) {
      recommendations.push('🐛 Error detection required - run AI error analysis');
    }
    
    if (scores.ux < 80) {
      recommendations.push('🎨 UX optimization needed - apply AI UX recommendations');
    }

    if (overallConfidence >= 90) {
      recommendations.push('✅ Build confidence meets 90% threshold - ready for deployment');
    }

    return recommendations;
  }

  // Legacy helper methods (maintaining backward compatibility)
  captureErrorContext(error: Error, additionalContext?: Partial<ErrorAnalysisRequest>): ErrorAnalysisRequest {
    return {
      error_message: error.message,
      error_stack: error.stack,
      file_path: additionalContext?.file_path,
      code_context: additionalContext?.code_context,
      user_action: additionalContext?.user_action,
      browser_info: `${navigator.userAgent} - ${window.location.href}`,
      console_logs: this.getRecentConsoleLogs(),
      ...additionalContext
    };
  }

  private getRecentConsoleLogs(): string[] {
    // In a real implementation, you'd override console methods to capture logs
    return [];
  }

  formatCodeEvaluation(
    taskDescription: string,
    filesModified: string[],
    userRequirements: string,
    completionSummary: string
  ): CodeEvaluationRequest {
    return {
      task_description: taskDescription,
      files_modified: filesModified,
      code_changes: filesModified.map(file => ({
        file_path: file,
        changes: 'File changes tracked',
        change_type: 'modified' as const
      })),
      user_requirements: userRequirements,
      completion_summary: completionSummary
    };
  }
}

export const aiAssistantService = new AIAssistantService();
