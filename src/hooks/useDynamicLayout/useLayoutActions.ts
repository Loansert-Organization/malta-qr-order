import { useCallback } from 'react';
import { contextService } from '@/services/contextService';
import { realTimeLayoutService } from '@/services/realTimeLayoutService';
import { LayoutRegenerationContext } from './types';
import { DynamicLayout } from '@/types/layout';
import { UnknownRecord } from '@/types/utilities';

export const useLayoutActions = (
  vendorId: string,
  contextData: UnknownRecord | null,
  setLayout: (layout: DynamicLayout) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  initializeLayout: () => Promise<void>
) => {
  const trackInteraction = useCallback(async (action: string, metadata?: UnknownRecord) => {
    await contextService.trackInteraction(action, {
      layout_section: metadata?.section,
      item_id: metadata?.item_id,
      category: metadata?.category,
      interaction_source: 'dynamic_layout',
      ...metadata
    });
  }, []);

  const updatePreferences = useCallback(async (preferences: UnknownRecord) => {
    await contextService.updatePreferences(preferences);
  }, []);

  const triggerLayoutRegeneration = useCallback(async () => {
    if (!contextData) return;

    setLoading(true);
    try {
      const success = await realTimeLayoutService.triggerLayoutRegeneration(vendorId, {
        session_id: contextData.session?.session_id,
        location: contextData.location?.city,
        weather: contextData.weather?.condition,
        user_preferences: contextData.preferences
      } as LayoutRegenerationContext);

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
  }, [vendorId, contextData, initializeLayout, setLoading, setError]);

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
  }, [vendorId, initializeLayout, setLayout, setLoading, setError]);

  return {
    trackInteraction,
    updatePreferences,
    triggerLayoutRegeneration,
    refreshLayout
  };
};
