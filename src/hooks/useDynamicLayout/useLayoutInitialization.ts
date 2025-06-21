
import { useCallback } from 'react';
import { layoutService } from '@/services/layoutService';
import { LayoutContext } from '@/types/layout';
import { contextService } from '@/services/contextService';

export const useLayoutInitialization = (
  vendorId: string,
  setLayout: (layout: any) => void,
  setContextData: (data: any) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
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
  }, [vendorId, setLayout, setContextData, setLoading, setError]);

  return { initializeLayout };
};
