
import { useState, useEffect, useCallback } from 'react';
import { DynamicLayout } from '@/types/layout';
import { useLayoutInitialization } from './useLayoutInitialization';
import { useRealTimeSubscriptions } from './useRealTimeSubscriptions';
import { useLayoutActions } from './useLayoutActions';
import { DynamicLayoutHookReturn } from './types';

export const useDynamicLayout = (vendorId: string): DynamicLayoutHookReturn => {
  const [layout, setLayout] = useState<DynamicLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contextData, setContextData] = useState<any>(null);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);

  // Initialize layout functionality
  const { initializeLayout } = useLayoutInitialization(
    vendorId,
    setLayout,
    setContextData,
    setLoading,
    setError
  );

  // Layout actions
  const { trackInteraction, updatePreferences, triggerLayoutRegeneration, refreshLayout } = useLayoutActions(
    vendorId,
    contextData,
    setLayout,
    setLoading,
    setError,
    initializeLayout
  );

  // Real-time subscriptions
  const { handleRealTimeLayoutUpdate } = useRealTimeSubscriptions(
    vendorId,
    contextData,
    setContextData,
    setIsRealTimeActive,
    initializeLayout,
    triggerLayoutRegeneration
  );

  // Handle real-time layout updates
  const handleLayoutUpdate = useCallback((newLayout: DynamicLayout) => {
    console.log('Received real-time layout update:', newLayout);
    setLayout(newLayout);
  }, []);

  // Set up initial layout and subscriptions
  useEffect(() => {
    if (!vendorId) return;

    console.log('Setting up dynamic layout for vendor:', vendorId);
    initializeLayout();
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

export * from './types';
