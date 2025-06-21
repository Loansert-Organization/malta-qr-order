
import { DynamicLayout } from '@/types/layout';
import { SubscriptionManager } from './subscriptionManager';
import { aiTrigger } from './aiTrigger';
import { layoutFetcher } from './layoutFetcher';

class RealTimeLayoutService {
  private subscriptionManager = new SubscriptionManager();

  subscribeToLayoutUpdates(vendorId: string, callback: (layout: DynamicLayout) => void) {
    return this.subscriptionManager.subscribeToLayoutUpdates(vendorId, callback);
  }

  async triggerLayoutRegeneration(vendorId: string, context?: any) {
    return aiTrigger.triggerLayoutRegeneration(vendorId, context);
  }

  async getLatestLayout(vendorId: string): Promise<DynamicLayout | null> {
    return layoutFetcher.getLatestLayout(vendorId);
  }

  getActiveSubscriptionsCount(): number {
    return this.subscriptionManager.getActiveSubscriptionsCount();
  }

  cleanup() {
    this.subscriptionManager.cleanup();
  }
}

export const realTimeLayoutService = new RealTimeLayoutService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    realTimeLayoutService.cleanup();
  });
}

export * from './types';
