
import { useCallback, useEffect } from 'react';
import { realTimeLayoutService } from '@/services/realTimeLayoutService';
import { contextService } from '@/services/contextService';
import { DynamicLayout } from '@/types/layout';
import { shouldRegenerateLayout } from './layoutUtils';

export const useRealTimeSubscriptions = (
  vendorId: string,
  contextData: any,
  setContextData: (data: any) => void,
  setIsRealTimeActive: (active: boolean) => void,
  initializeLayout: () => Promise<void>,
  triggerLayoutRegeneration: () => Promise<void>
) => {
  const handleRealTimeLayoutUpdate = useCallback((newLayout: DynamicLayout) => {
    console.log('Received real-time layout update:', newLayout);
    // This will be handled by the main hook
  }, []);

  useEffect(() => {
    if (!vendorId) return;

    console.log('Setting up real-time subscriptions for vendor:', vendorId);
    
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
  }, [vendorId, contextData, handleRealTimeLayoutUpdate, setContextData, setIsRealTimeActive, triggerLayoutRegeneration]);

  return { handleRealTimeLayoutUpdate };
};
