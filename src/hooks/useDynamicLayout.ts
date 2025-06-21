
import { useState, useEffect, useCallback } from 'react';
import { layoutService } from '@/services/layoutService';
import { LayoutContext, DynamicLayout } from '@/types/layout';
import { contextService } from '@/services/contextService';
import { realTimeLayoutService } from '@/services/realTimeLayoutService';

export const useDynamicLayout = (vendorId: string) => {
  const [layout, setLayout] = useState<DynamicLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contextData, setContextData] = useState<any>(null);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);

  // Handle real-time layout updates
  const handleRealTimeLayoutUpdate = useCallback((newLayout: DynamicLayout) => {
    console.log('Received real-time layout update:', newLayout);
    setLayout(newLayout);
  }, []);

  // Initialize layout and context
  const initializeLayout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize guest session
      await contextService.getOrCreateGuestSession(vendorId);
      
      // Get contextual data
      const contextualData = contextService.getContextualData();
      setContextData(contextualData);
      
      // Build layout context
      const layoutContext: LayoutContext = {
        vendor_id: vendorId,
        session_id: contextualData.session?.session_id,
        time_of_day: contextualData.time_context.time_of_day,
        day_of_week: contextualData.time_context.day_of_week,
        location: contextualData.location?.city,
        weather: contextualData.weather?.condition,
        user_preferences: {
          dietary_restrictions: contextualData.preferences.dietary_restrictions || [],
          favorite_categories: contextualData.preferences.favorite_categories || [],
          price_sensitivity: contextualData.preferences.price_range === 'budget' ? 'high' : 
                            contextualData.preferences.price_range === 'premium' ? 'low' : 'medium'
        },
        order_history: contextualData.recent_interactions
      };

      // Generate dynamic layout
      const dynamicLayout = await layoutService.generateDynamicLayout(layoutContext);
      
      if (dynamicLayout) {
        setLayout(dynamicLayout);
        console.log('Dynamic layout loaded:', dynamicLayout);
      } else {
        setError('Failed to generate layout');
      }
      
    } catch (err) {
      console.error('Failed to initialize dynamic layout:', err);
      setError(err instanceof Error ? err.message : 'Failed to load layout');
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!vendorId) return;

    console.log('Setting up dynamic layout for vendor:', vendorId);
    
    // Initialize layout
    initializeLayout();

    // Subscribe to real-time layout updates
    const unsubscribeRealTime = realTimeLayoutService.subscribeToLayoutUpdates(
      vendorId, 
      handleRealTimeLayoutUpdate
    );
    setIsRealTimeActive(true);

    // Subscribe to context updates
    const unsubscribeContext = contextService.subscribeToContextUpdates(() => {
      console.log('Context updated, refreshing layout data');
      const newContextData = contextService.getContextualData();
      setContextData(newContextData);
      
      // Trigger layout regeneration if significant context changes
      if (shouldRegenerateLayout(contextData, newContextData)) {
        console.log('Significant context change detected, regenerating layout');
        triggerLayoutRegeneration();
      }
    });

    return () => {
      unsubscribeRealTime();
      unsubscribeContext();
      setIsRealTimeActive(false);
    };
  }, [vendorId, initializeLayout, handleRealTimeLayoutUpdate]);

  // Track interactions with the layout
  const trackInteraction = useCallback(async (action: string, metadata?: any) => {
    await contextService.trackInteraction(action, {
      layout_section: metadata?.section,
      item_id: metadata?.item_id,
      category: metadata?.category,
      interaction_source: 'dynamic_layout',
      ...metadata
    });
  }, []);

  // Update user preferences
  const updatePreferences = useCallback(async (preferences: any) => {
    await contextService.updatePreferences(preferences);
  }, []);

  // Manually trigger layout regeneration
  const triggerLayoutRegeneration = useCallback(async () => {
    if (!contextData) return;

    setLoading(true);
    try {
      const success = await realTimeLayoutService.triggerLayoutRegeneration(vendorId, {
        session_id: contextData.session?.session_id,
        location: contextData.location?.city,
        weather: contextData.weather?.condition,
        user_preferences: contextData.preferences
      });

      if (!success) {
        // Fallback to direct layout generation
        await initializeLayout();
      }
    } catch (error) {
      console.error('Failed to trigger layout regeneration:', error);
      setError('Failed to update layout');
    } finally {
      setLoading(false);
    }
  }, [vendorId, contextData, initializeLayout]);

  // Get fresh layout from cache/database
  const refreshLayout = useCallback(async () => {
    setLoading(true);
    try {
      const latestLayout = await realTimeLayoutService.getLatestLayout(vendorId);
      if (latestLayout) {
        setLayout(latestLayout);
      } else {
        await initializeLayout();
      }
    } catch (error) {
      console.error('Failed to refresh layout:', error);
      setError('Failed to refresh layout');
    } finally {
      setLoading(false);
    }
  }, [vendorId, initializeLayout]);

  return {
    layout,
    loading,
    error,
    contextData,
    isRealTimeActive,
    trackInteraction,
    updatePreferences,
    triggerLayoutRegeneration,
    refreshLayout
  };
};

// Helper function to determine if layout should be regenerated based on context changes
function shouldRegenerateLayout(oldContext: any, newContext: any): boolean {
  if (!oldContext || !newContext) return false;

  // Check for significant time changes (meal period)
  if (oldContext.time_context?.meal_period !== newContext.time_context?.meal_period) {
    return true;
  }

  // Check for weather changes
  if (oldContext.weather?.condition !== newContext.weather?.condition) {
    return true;
  }

  // Check for significant interaction pattern changes
  const oldEngagement = oldContext.ai_insights?.engagement_score || 0;
  const newEngagement = newContext.ai_insights?.engagement_score || 0;
  if (Math.abs(oldEngagement - newEngagement) > 20) {
    return true;
  }

  // Check for preference changes
  const oldPrefs = JSON.stringify(oldContext.preferences || {});
  const newPrefs = JSON.stringify(newContext.preferences || {});
  if (oldPrefs !== newPrefs) {
    return true;
  }

  return false;
}
