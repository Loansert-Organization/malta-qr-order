import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Json } from '@/integrations/supabase/types';

type Vendor = Tables<'vendors'>;
type VendorApproval = Tables<'vendor_approvals'>;

export interface VendorStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  byLocation: Record<string, number>;
}

export interface VendorAnalytics {
  vendor: Vendor;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  customerSatisfaction: number;
  lastOrderDate: string | null;
}

class VendorManagementService {
  async getVendorStats(): Promise<VendorStats> {
    try {
      const { data: vendors, error } = await supabase
        .from('vendors')
        .select('active, location');

      if (error) throw error;

      const stats: VendorStats = {
        total: vendors?.length || 0,
        active: 0,
        pending: 0,
        suspended: 0,
        byLocation: {}
      };

      vendors?.forEach(vendor => {
        if (vendor.active) {
          stats.active++;
        } else {
          stats.suspended++;
        }

        if (vendor.location) {
          stats.byLocation[vendor.location] = (stats.byLocation[vendor.location] || 0) + 1;
        }
      });

      // Get pending approvals
      const { count: pendingCount } = await supabase
        .from('vendor_approvals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      stats.pending = pendingCount || 0;

      return stats;
    } catch (error) {
      console.error('Failed to get vendor stats:', error);
      throw error;
    }
  }

  async getVendorAnalytics(vendorId: string): Promise<VendorAnalytics | null> {
    try {
      // Get vendor details
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single();

      if (vendorError || !vendor) return null;

      // Get order analytics
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .eq('vendor_id', vendorId);

      const completedOrders = orders?.filter(order => order.status === 'completed') || [];
      const totalOrders = completedOrders.length;
      const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get customer satisfaction from AI waiter logs
      const { data: aiLogs } = await supabase
        .from('ai_waiter_logs')
        .select('satisfaction_score')
        .eq('vendor_id', vendorId)
        .not('satisfaction_score', 'is', null);

      const avgSatisfaction = aiLogs && aiLogs.length > 0
        ? aiLogs.reduce((sum, log) => sum + (log.satisfaction_score || 0), 0) / aiLogs.length
        : 0;

      const lastOrderDate = orders && orders.length > 0
        ? orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : null;

      return {
        vendor,
        totalOrders,
        totalRevenue,
        averageOrderValue,
        customerSatisfaction: avgSatisfaction,
        lastOrderDate
      };
    } catch (error) {
      console.error('Failed to get vendor analytics:', error);
      throw error;
    }
  }

  async approveVendor(vendorId: string, approvedBy: string, notes?: string): Promise<void> {
    try {
      // Update vendor status
      const { error: vendorError } = await supabase
        .from('vendors')
        .update({ active: true })
        .eq('id', vendorId);

      if (vendorError) throw vendorError;

      // Update approval record
      const { error: approvalError } = await supabase
        .from('vendor_approvals')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
          notes
        })
        .eq('vendor_id', vendorId);

      if (approvalError) throw approvalError;

      // Create vendor config
      const { error: configError } = await supabase
        .from('vendor_config')
        .insert({
          vendor_id: vendorId,
          ai_waiter_enabled: true,
          dynamic_ui_enabled: true,
          voice_search_enabled: true,
          weather_suggestions_enabled: true
        });

      if (configError) throw configError;

    } catch (error) {
      console.error('Failed to approve vendor:', error);
      throw error;
    }
  }

  async suspendVendor(vendorId: string, reason: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ active: false })
        .eq('id', vendorId);

      if (error) throw error;

      // Log the suspension
      await supabase
        .from('system_logs')
        .insert({
          component: 'vendor_management',
          log_type: 'vendor_suspension',
          message: `Vendor ${vendorId} suspended: ${reason}`,
          severity: 'warning',
          metadata: { vendor_id: vendorId, reason }
        });

    } catch (error) {
      console.error('Failed to suspend vendor:', error);
      throw error;
    }
  }

  async bulkUpdateVendors(vendorIds: string[], updates: Partial<Vendor>): Promise<void> {
    try {
      const { error } = await supabase
        .from('vendors')
        .update(updates)
        .in('id', vendorIds);

      if (error) throw error;

      // Log bulk operation
      await supabase
        .from('vendor_bulk_operations')
        .insert({
          operation_type: 'bulk_update',
          vendor_ids: vendorIds,
          parameters: updates,
          performed_by: 'system', // This should be the current user ID
          status: 'completed',
          completed_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Failed to bulk update vendors:', error);
      throw error;
    }
  }

  async getVendorApprovals(status?: string): Promise<VendorApproval[]> {
    try {
      let query = supabase
        .from('vendor_approvals')
        .select(`
          *,
          vendors (
            id,
            name,
            location,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get vendor approvals:', error);
      throw error;
    }
  }
}

export const vendorManagementService = new VendorManagementService();

export const logVendorOperation = async (
  operationType: string,
  vendorIds: string[],
  performedBy: string,
  parameters: Record<string, any> = {},
  results: Record<string, any> = {}
) => {
  try {
    // Convert the parameters and results to valid JSON, excluding problematic fields
    const sanitizedParameters = sanitizeForJson(parameters);
    const sanitizedResults = sanitizeForJson(results);

    const { error } = await supabase
      .from('vendor_bulk_operations')
      .insert({
        operation_type: operationType,
        vendor_ids: vendorIds,
        performed_by: performedBy,
        parameters: sanitizedParameters as Json,
        results: sanitizedResults as Json,
        status: 'completed'
      });

    if (error) {
      console.error('Error logging vendor operation:', error);
    }
  } catch (error) {
    console.error('Error in logVendorOperation:', error);
  }
};

// Helper function to sanitize objects for JSON storage
const sanitizeForJson = (obj: any): Record<string, any> => {
  if (obj === null || obj === undefined) return {};
  
  if (typeof obj !== 'object') return { value: obj };
  
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip problematic fields that can't be serialized to JSON
    if (key === 'location_geo' || value === undefined) continue;
    
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForJson(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

export const createBulkVendorUpdate = async (
  vendorIds: string[],
  updates: Partial<Record<string, any>>,
  performedBy: string
) => {
  try {
    const sanitizedUpdates = sanitizeForJson(updates);
    
    const { error } = await supabase
      .from('vendors')
      .update(sanitizedUpdates)
      .in('id', vendorIds);

    if (error) throw error;

    await logVendorOperation('bulk_update', vendorIds, performedBy, sanitizedUpdates);
    
    return { success: true };
  } catch (error) {
    console.error('Error in bulk vendor update:', error);
    return { success: false, error };
  }
};

export const getVendorAnalytics = async (vendorId: string, dateRange: { start: Date; end: Date }) => {
  try {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('vendor_id', vendorId)
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());

    const { data: analytics } = await supabase
      .from('analytics')
      .select('*')
      .eq('vendor_id', vendorId)
      .gte('date', dateRange.start.toISOString().split('T')[0])
      .lte('date', dateRange.end.toISOString().split('T')[0]);

    return {
      orders: orders || [],
      analytics: analytics || [],
      summary: {
        totalOrders: orders?.length || 0,
        totalRevenue: orders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0
      }
    };
  } catch (error) {
    console.error('Error fetching vendor analytics:', error);
    return { orders: [], analytics: [], summary: { totalOrders: 0, totalRevenue: 0 } };
  }
};
