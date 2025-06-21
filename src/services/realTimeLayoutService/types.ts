
import { DynamicLayout } from '@/types/layout';

export interface LayoutUpdate {
  vendor_id: string;
  layout_data: string;
  timestamp: string;
  confidence_score?: number;
}

export interface LayoutSubscription {
  vendorId: string;
  callback: (layout: DynamicLayout) => void;
  unsubscribe: () => void;
}
