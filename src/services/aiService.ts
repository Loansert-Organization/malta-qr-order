// AI Service for Malta QR Order platform
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validateEnvironment } from '@/lib/security';

// =============================================================================
// AI SERVICE CONFIGURATION
// =============================================================================

interface AIServiceConfig {
  maxRetries: number;
  timeout: number;
  enableLogging: boolean;
}

const DEFAULT_CONFIG: AIServiceConfig = {
  maxRetries: 3,
  timeout: 30000, // 30 seconds
  enableLogging: import.meta.env.DEV,
};

// =============================================================================
// AI SERVICE CLASS
// =============================================================================

export class AIService {
  private config: AIServiceConfig;
  private rateLimiter: Map<string, number[]> = new Map();

  constructor(config: Partial<AIServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.validateEnvironment();
  }

  private validateEnvironment(): void {
    try {
      validateEnvironment();
    } catch (error) {
      console.error('AI Service environment validation failed:', error);
      throw new Error('AI Service configuration error');
    }
  }

  // =============================================================================
  // RATE LIMITING
  // =============================================================================

  private isRateLimited(functionName: string): boolean {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 10; // 10 requests per minute

    if (!this.rateLimiter.has(functionName)) {
      this.rateLimiter.set(functionName, [now]);
      return false;
    }

    const requests = this.rateLimiter.get(functionName)!;
    const recentRequests = requests.filter(time => time > now - windowMs);

    if (recentRequests.length >= maxRequests) {
      return true;
    }

    recentRequests.push(now);
    this.rateLimiter.set(functionName, recentRequests);
    return false;
  }

  // =============================================================================
  // CORE AI FUNCTION CALLER
  // =============================================================================

  private async callAIFunction<T>(
    functionName: string,
    payload: Record<string, unknown>,
    retryCount = 0
  ): Promise<T> {
    if (this.isRateLimited(functionName)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      if (this.config.enableLogging) {
        console.log(`🤖 Calling AI function: ${functionName}`, payload);
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        throw new Error(`AI function error: ${error.message}`);
      }

      if (this.config.enableLogging) {
        console.log(`✅ AI function ${functionName} response:`, data);
      }

      return data as T;
    } catch (error) {
      if (retryCount < this.config.maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.callAIFunction(functionName, payload, retryCount + 1);
      }

      console.error(`❌ AI function ${functionName} failed after ${retryCount + 1} retries:`, error);
      throw error;
    }
  }

  // =============================================================================
  // AI WAITER CHAT
  // =============================================================================

  async sendChatMessage(
    message: string,
    vendorId: string,
    guestSessionId: string,
    context?: Record<string, unknown>
  ) {
    try {
      const response = await this.callAIFunction('ai_waiter_chat', {
        message,
        vendor_id: vendorId,
        guest_session_id: guestSessionId,
        context: context || {},
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      throw error;
    }
  }

  async getChatSuggestions(
    vendorId: string,
    guestSessionId: string,
    currentContext?: Record<string, unknown>
  ) {
    try {
      const response = await this.callAIFunction('ai_waiter_suggest', {
        vendor_id: vendorId,
        guest_session_id: guestSessionId,
        context: currentContext || {},
      });

      return response;
    } catch (error) {
      console.error('Failed to get chat suggestions:', error);
      return { suggestions: [] };
    }
  }

  // =============================================================================
  // AI MENU RECOMMENDATIONS
  // =============================================================================

  async getMenuRecommendations(
    vendorId: string,
    preferences: Record<string, unknown>,
    weather?: Record<string, unknown>
  ) {
    try {
      const response = await this.callAIFunction('ai-sommelier', {
        vendor_id: vendorId,
        preferences,
        weather,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      console.error('Failed to get menu recommendations:', error);
      return { recommendations: [] };
    }
  }

  // =============================================================================
  // AI UPSELL SUGGESTIONS
  // =============================================================================

  async getUpsellSuggestions(
    orderId: string,
    currentItems: Array<{ id: string; name: string; price: number }>,
    vendorId: string
  ) {
    try {
      const response = await this.callAIFunction('ai-upsell-suggestion', {
        order_id: orderId,
        current_items: currentItems,
        vendor_id: vendorId,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      console.error('Failed to get upsell suggestions:', error);
      return { suggestions: [] };
    }
  }

  // =============================================================================
  // AI SYSTEM HEALTH
  // =============================================================================

  async checkSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, { status: string; responseTime: number }>;
    timestamp: string;
  }> {
    try {
      const response = await this.callAIFunction('ai-system-health', {
        check_timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      console.error('Failed to check system health:', error);
      return {
        status: 'unhealthy',
        services: {},
        timestamp: new Date().toISOString(),
      };
    }
  }

  // =============================================================================
  // AI LAYOUT GENERATION
  // =============================================================================

  async generateDynamicLayout(
    vendorId: string,
    context: {
      timeOfDay: string;
      weather: Record<string, unknown>;
      userPreferences: Record<string, unknown>;
      currentOrders: number;
    }
  ) {
    try {
      const response = await this.callAIFunction('ai-layout-generator', {
        vendor_id: vendorId,
        context,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      console.error('Failed to generate dynamic layout:', error);
      return { layout: null, error: 'Layout generation failed' };
    }
  }

  // =============================================================================
  // AI ERROR HANDLING
  // =============================================================================

  async handleAIError(
    error: Error,
    context: {
      functionName: string;
      vendorId: string;
      guestSessionId?: string;
      userAgent: string;
    }
  ) {
    try {
      const response = await this.callAIFunction('ai-error-handler', {
        error_message: error.message,
        error_stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (reportError) {
      console.error('Failed to report AI error:', reportError);
      return { handled: false, suggestion: 'Please try again later' };
    }
  }

  // =============================================================================
  // AI TASK REVIEW
  // =============================================================================

  async reviewTask(
    taskType: string,
    taskData: Record<string, unknown>,
    vendorId: string
  ) {
    try {
      const response = await this.callAIFunction('ai-task-review', {
        task_type: taskType,
        task_data: taskData,
        vendor_id: vendorId,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      console.error('Failed to review task:', error);
      return { review: null, error: 'Task review failed' };
    }
  }

  // =============================================================================
  // AI UX RECOMMENDATIONS
  // =============================================================================

  async getUXRecommendations(
    vendorId: string,
    userBehavior: Record<string, unknown>,
    currentMetrics: Record<string, unknown>
  ) {
    try {
      const response = await this.callAIFunction('ai-ux-recommendation', {
        vendor_id: vendorId,
        user_behavior: userBehavior,
        current_metrics: currentMetrics,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      console.error('Failed to get UX recommendations:', error);
      return { recommendations: [] };
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  async ping(): Promise<boolean> {
    try {
      await this.callAIFunction('ai-system-health', { ping: true });
      return true;
    } catch {
      return false;
    }
  }

  getConfig(): AIServiceConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const aiService = new AIService();

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export const sendChatMessage = aiService.sendChatMessage.bind(aiService);
export const getMenuRecommendations = aiService.getMenuRecommendations.bind(aiService);
export const getUpsellSuggestions = aiService.getUpsellSuggestions.bind(aiService);
export const checkSystemHealth = aiService.checkSystemHealth.bind(aiService);
export const generateDynamicLayout = aiService.generateDynamicLayout.bind(aiService);
export const handleAIError = aiService.handleAIError.bind(aiService); 