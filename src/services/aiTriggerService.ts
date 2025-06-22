
import { supabase } from '@/integrations/supabase/client';

interface AITaskReviewRequest {
  task_description: string;
  implementation_details: string;
  expected_outcome: string;
  priority: 'high' | 'medium' | 'low';
}

interface AIErrorFixRequest {
  error_message: string;
  error_context: string;
  component_path?: string;
  user_action?: string;
}

interface AIUXRecommendationRequest {
  current_page: string;
  user_journey_step: string;
  improvement_area: string;
  target_audience: 'guest' | 'vendor' | 'admin';
}

export class AITriggerService {
  
  static async reviewImplementation(request: AITaskReviewRequest) {
    try {
      console.log('🔍 Triggering AI task review...');
      
      const { data, error } = await supabase.functions.invoke('ai-task-review', {
        body: request
      });
      
      if (error) {
        console.error('AI task review error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ AI task review completed:', data);
      return { success: true, data };
      
    } catch (error) {
      console.error('AI task review failed:', error);
      return { success: false, error: 'Failed to trigger AI review' };
    }
  }
  
  static async fixError(request: AIErrorFixRequest) {
    try {
      console.log('🔧 Triggering AI error fix...');
      
      const { data, error } = await supabase.functions.invoke('ai-error-fix', {
        body: request
      });
      
      if (error) {
        console.error('AI error fix error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ AI error fix completed:', data);
      return { success: true, data };
      
    } catch (error) {
      console.error('AI error fix failed:', error);
      return { success: false, error: 'Failed to trigger AI error fix' };
    }
  }
  
  static async getUXRecommendation(request: AIUXRecommendationRequest) {
    try {
      console.log('🎨 Triggering AI UX recommendation...');
      
      const { data, error } = await supabase.functions.invoke('ai-ux-recommendation', {
        body: request
      });
      
      if (error) {
        console.error('AI UX recommendation error:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ AI UX recommendation completed:', data);
      return { success: true, data };
      
    } catch (error) {
      console.error('AI UX recommendation failed:', error);
      return { success: false, error: 'Failed to trigger AI UX recommendation' };
    }
  }
  
  static async reviewFullImplementation() {
    console.log('🚀 Starting comprehensive AI review of ICUPA Malta implementation...');
    
    const reviews = await Promise.allSettled([
      // Review core client experience
      this.reviewImplementation({
        task_description: 'Client ordering experience implementation',
        implementation_details: 'Complete guest ordering flow with QR codes, AI waiter, dynamic menus, and checkout',
        expected_outcome: 'Seamless anonymous ordering experience with AI assistance',
        priority: 'high'
      }),
      
      // Review vendor functionality  
      this.reviewImplementation({
        task_description: 'Vendor dashboard and management system',
        implementation_details: 'Restaurant registration, menu management, order tracking, and analytics',
        expected_outcome: 'Complete vendor management suite with real-time updates',
        priority: 'high'
      }),
      
      // Review admin capabilities
      this.reviewImplementation({
        task_description: 'Admin panel and system oversight',
        implementation_details: 'Vendor approval, AI monitoring, platform analytics, and system health',
        expected_outcome: 'Comprehensive admin control with AI insights',
        priority: 'medium'
      }),
      
      // Review AI integration
      this.reviewImplementation({
        task_description: 'AI system integration and coordination',
        implementation_details: 'GPT-4o, Claude-4, Gemini coordination for dynamic UI, recommendations, and chat',
        expected_outcome: 'Intelligent, context-aware AI assistance across all platforms',
        priority: 'high'
      }),
      
      // Review payment system
      this.reviewImplementation({
        task_description: 'Payment processing integration',
        implementation_details: 'Stripe and Revolut integration with order management',
        expected_outcome: 'Secure, flexible payment options for all users',
        priority: 'high'
      })
    ]);
    
    reviews.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ Review ${index + 1} completed successfully`);
      } else {
        console.error(`❌ Review ${index + 1} failed:`, result.reason);
      }
    });
    
    return reviews;
  }
}

// Auto-trigger comprehensive review
setTimeout(() => {
  AITriggerService.reviewFullImplementation();
}, 2000);
