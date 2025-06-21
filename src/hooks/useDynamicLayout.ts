
import { useState, useEffect } from 'react';
import { layoutService, DynamicLayout, LayoutContext } from '@/services/layoutService';
import { contextService } from '@/services/contextService';

export const useDynamicLayout = (vendorId: string) => {
  const [layout, setLayout] = useState<DynamicLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeLayout = async () => {
      try {
        setLoading(true);
        
        // Initialize guest session
        await contextService.getOrCreateGuestSession(vendorId);
        
        // Get contextual data
        const contextData = contextService.getContextualData();
        
        // Build layout context
        const layoutContext: LayoutContext = {
          vendor_id: vendorId,
          session_id: contextData.session?.session_id,
          time_of_day: contextData.time_context.time_of_day,
          day_of_week: contextData.time_context.day_of_week,
          location: contextData.location?.city,
          user_preferences: contextData.preferences
        };

        // Generate dynamic layout
        const dynamicLayout = await layoutService.generateDynamicLayout(layoutContext);
        
        if (dynamicLayout) {
          setLayout(dynamicLayout);
          console.log('Dynamic layout loaded:', dynamicLayout);
        }
        
      } catch (err) {
        console.error('Failed to initialize dynamic layout:', err);
        setError(err instanceof Error ? err.message : 'Failed to load layout');
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      initializeLayout();
    }
  }, [vendorId]);

  const trackInteraction = async (action: string, metadata?: any) => {
    await contextService.trackInteraction(action, metadata);
  };

  const updatePreferences = async (preferences: any) => {
    await contextService.updatePreferences(preferences);
  };

  return {
    layout,
    loading,
    error,
    trackInteraction,
    updatePreferences
  };
};
