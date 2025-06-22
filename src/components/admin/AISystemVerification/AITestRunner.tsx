
import React from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemHealthCheck {
  component: string;
  status: 'healthy' | 'degraded' | 'down' | 'testing';
  responseTime?: number;
  error?: string;
  details?: string;
}

interface AITestRunnerProps {
  updateHealthCheck: (component: string, update: Partial<SystemHealthCheck>) => void;
  setTestResults: React.Dispatch<React.SetStateAction<any[]>>;
}

export const useAITestRunner = ({ updateHealthCheck, setTestResults }: AITestRunnerProps) => {
  const testAISystemHealth = async () => {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke('ai-system-health');
      const responseTime = Date.now() - startTime;
      
      if (error) throw error;
      
      updateHealthCheck('AI System Health', {
        status: data.overall_status,
        responseTime,
        details: `Models: ${data.models?.length || 0}, DB: ${data.database_status}`
      });
      
      setTestResults(prev => [...prev, {
        test: 'AI System Health',
        result: data,
        timestamp: new Date().toISOString()
      }]);
      
      return data;
    } catch (error) {
      updateHealthCheck('AI System Health', {
        status: 'down',
        error: error.message,
        responseTime: Date.now() - startTime
      });
      throw error;
    }
  };

  const testMaltaAIWaiter = async () => {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke('malta-ai-waiter', {
        body: {
          message: 'Test message for system verification',
          vendorSlug: 'ta-kris',
          guestSessionId: 'verification-test',
          language: 'en',
          locationContext: {
            vendorLocation: 'St. Julian\'s',
            area: 'St. Julian\'s'
          }
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (error) throw error;
      
      updateHealthCheck('Malta AI Waiter', {
        status: 'healthy',
        responseTime,
        details: `Response length: ${data.response?.length || 0} chars, Suggestions: ${data.suggestions?.length || 0}`
      });
      
      setTestResults(prev => [...prev, {
        test: 'Malta AI Waiter',
        result: data,
        timestamp: new Date().toISOString()
      }]);
      
      return data;
    } catch (error) {
      updateHealthCheck('Malta AI Waiter', {
        status: 'down',
        error: error.message,
        responseTime: Date.now() - startTime
      });
      throw error;
    }
  };

  const testAIRouter = async () => {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke('ai-router', {
        body: {
          model: 'gpt-4o',
          task: 'contextual_analysis',
          context: {
            vendor_id: 'test-vendor',
            time_context: 'afternoon',
            location: 'Malta'
          },
          prompt: 'Analyze this context for verification testing',
          config: {
            temperature: 0.5,
            max_tokens: 200
          }
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (error) throw error;
      
      updateHealthCheck('AI Router', {
        status: 'healthy',
        responseTime,
        details: `Model: ${data.model_used}, Confidence: ${data.confidence_score || 'N/A'}`
      });
      
      setTestResults(prev => [...prev, {
        test: 'AI Router',
        result: data,
        timestamp: new Date().toISOString()
      }]);
      
      return data;
    } catch (error) {
      updateHealthCheck('AI Router', {
        status: 'down',
        error: error.message,
        responseTime: Date.now() - startTime
      });
      throw error;
    }
  };

  return {
    testAISystemHealth,
    testMaltaAIWaiter,
    testAIRouter
  };
};
