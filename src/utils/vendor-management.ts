
import { createClient } from '@supabase/supabase-js';
import React from 'react';
import { NotificationService } from './notification-service';

export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type BulkOperationType = 'bulk_approve' | 'bulk_reject' | 'bulk_suspend' | 'bulk_update';

export interface VendorApproval {
  vendorId: string;
  status: VendorStatus;
  notes?: string;
  documents?: string[];
}

export interface BulkOperation {
  operationType: BulkOperationType;
  vendorIds: string[];
  parameters?: Record<string, any>;
}

export class VendorManagementService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  private notificationService = new NotificationService();

  // Get vendors with filtering and pagination
  async getVendors(
    filters: {
      status?: VendorStatus;
      search?: string;
      location?: string;
      category?: string;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ vendors: any[]; total: number }> {
    try {
      let query = this.supabase
        .from('vendors')
        .select(`
          *,
          vendor_approvals(status, notes, approved_at, approved_by),
          profiles(full_name, email, phone)
        `, { count: 'exact' });

      // Apply filters
      if (filters.status) {
        query = query.eq('vendor_approvals.status', filters.status);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.location) {
        query = query.eq('location', filters.location);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      // Apply pagination
      const { data: vendors, error, count } = await query
        .range(
          (pagination.page - 1) * pagination.limit,
          pagination.page * pagination.limit - 1
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { vendors: vendors || [], total: count || 0 };
    } catch (error) {
      console.error('Failed to get vendors:', error);
      throw error;
    }
  }

  // Approve vendor
  async approveVendor(
    vendorId: string,
    approvedBy: string,
    notes?: string
  ): Promise<void> {
    try {
      // Update or create approval record
      const { error: approvalError } = await this.supabase
        .from('vendor_approvals')
        .upsert({
          vendor_id: vendorId,
          status: 'approved',
          approved_by: approvedBy,
          notes: notes,
          approved_at: new Date().toISOString()
        });

      if (approvalError) throw approvalError;

      // Update vendor status
      const { error: vendorError } = await this.supabase
        .from('vendors')
        .update({ status: 'active' })
        .eq('id', vendorId);

      if (vendorError) throw vendorError;

      // Get vendor details for notification
      const { data: vendor } = await this.supabase
        .from('vendors')
        .select('*, profiles(email)')
        .eq('id', vendorId)
        .single();

      if (vendor?.user_id) {
        // Send approval notification
        await this.notificationService.sendFromTemplate(
          'vendor_approved',
          vendor.user_id,
          { vendorName: vendor.name }
        );
      }
    } catch (error) {
      console.error('Failed to approve vendor:', error);
      throw error;
    }
  }

  // Reject vendor
  async rejectVendor(
    vendorId: string,
    rejectedBy: string,
    notes: string
  ): Promise<void> {
    try {
      const { error: approvalError } = await this.supabase
        .from('vendor_approvals')
        .upsert({
          vendor_id: vendorId,
          status: 'rejected',
          approved_by: rejectedBy,
          notes: notes,
          approved_at: new Date().toISOString()
        });

      if (approvalError) throw approvalError;

      const { error: vendorError } = await this.supabase
        .from('vendors')
        .update({ status: 'inactive' })
        .eq('id', vendorId);

      if (vendorError) throw vendorError;

      // Get vendor details for notification
      const { data: vendor } = await this.supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single();

      if (vendor?.user_id) {
        await this.notificationService.sendNotification({
          userId: vendor.user_id,
          title: 'Vendor Application Update',
          body: `Your vendor application has been rejected. Reason: ${notes}`,
          type: 'email'
        });
      }
    } catch (error) {
      console.error('Failed to reject vendor:', error);
      throw error;
    }
  }

  // Suspend vendor
  async suspendVendor(
    vendorId: string,
    suspendedBy: string,
    reason: string
  ): Promise<void> {
    try {
      const { error: approvalError } = await this.supabase
        .from('vendor_approvals')
        .upsert({
          vendor_id: vendorId,
          status: 'suspended',
          approved_by: suspendedBy,
          notes: reason,
          approved_at: new Date().toISOString()
        });

      if (approvalError) throw approvalError;

      const { error: vendorError } = await this.supabase
        .from('vendors')
        .update({ status: 'suspended' })
        .eq('id', vendorId);

      if (vendorError) throw vendorError;

      // Notify vendor
      const { data: vendor } = await this.supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single();

      if (vendor?.user_id) {
        await this.notificationService.sendNotification({
          userId: vendor.user_id,
          title: 'Account Suspended',
          body: `Your vendor account has been suspended. Reason: ${reason}`,
          type: 'email'
        });
      }
    } catch (error) {
      console.error('Failed to suspend vendor:', error);
      throw error;
    }
  }

  // Bulk operations
  async performBulkOperation(
    operation: BulkOperation,
    performedBy: string
  ): Promise<string> {
    try {
      // Create bulk operation record
      const { data: bulkOp, error: createError } = await this.supabase
        .from('vendor_bulk_operations')
        .insert({
          operation_type: operation.operationType,
          vendor_ids: operation.vendorIds,
          performed_by: performedBy,
          parameters: operation.parameters || {},
          status: 'processing'
        })
        .select()
        .single();

      if (createError) throw createError;

      // Process operation in background
      this.processBulkOperation(bulkOp.id, operation, performedBy);

      return bulkOp.id;
    } catch (error) {
      console.error('Failed to start bulk operation:', error);
      throw error;
    }
  }

  // Process bulk operation
  private async processBulkOperation(
    operationId: string,
    operation: BulkOperation,
    performedBy: string
  ): Promise<void> {
    const results: { success: string[]; failed: string[] } = {
      success: [],
      failed: []
    };

    try {
      for (const vendorId of operation.vendorIds) {
        try {
          switch (operation.operationType) {
            case 'bulk_approve':
              await this.approveVendor(
                vendorId,
                performedBy,
                operation.parameters?.notes
              );
              results.success.push(vendorId);
              break;

            case 'bulk_reject':
              await this.rejectVendor(
                vendorId,
                performedBy,
                operation.parameters?.reason || 'Bulk rejection'
              );
              results.success.push(vendorId);
              break;

            case 'bulk_suspend':
              await this.suspendVendor(
                vendorId,
                performedBy,
                operation.parameters?.reason || 'Bulk suspension'
              );
              results.success.push(vendorId);
              break;

            case 'bulk_update':
              await this.updateVendorBulk(vendorId, operation.parameters || {});
              results.success.push(vendorId);
              break;
          }
        } catch (error) {
          console.error(`Failed to process vendor ${vendorId}:`, error);
          results.failed.push(vendorId);
        }
      }

      // Update operation status
      await this.supabase
        .from('vendor_bulk_operations')
        .update({
          status: 'completed',
          results: results,
          completed_at: new Date().toISOString()
        })
        .eq('id', operationId);

    } catch (error) {
      console.error('Bulk operation failed:', error);
      
      await this.supabase
        .from('vendor_bulk_operations')
        .update({
          status: 'failed',
          results: results,
          completed_at: new Date().toISOString()
        })
        .eq('id', operationId);
    }
  }

  // Update vendor (for bulk operations)
  private async updateVendorBulk(
    vendorId: string,
    updates: Record<string, any>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('vendors')
      .update(updates)
      .eq('id', vendorId);

    if (error) throw error;
  }

  // Get bulk operation status
  async getBulkOperationStatus(operationId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('vendor_bulk_operations')
      .select('*')
      .eq('id', operationId)
      .single();

    if (error) throw error;
    return data;
  }

  // Get vendor analytics
  async getVendorAnalytics(): Promise<any> {
    try {
      // Get vendor counts by status
      const { data: statusCounts } = await this.supabase
        .from('vendor_approvals')
        .select('status, count(*)')
        .group('status');

      // Get recent vendor registrations (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const { data: recentVendors, count: recentCount } = await this.supabase
        .from('vendors')
        .select('*', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Get top performing vendors
      const { data: topVendors } = await this.supabase
        .from('vendors')
        .select(`
          *,
          orders(count)
        `)
        .order('orders(count)', { ascending: false })
        .limit(10);

      return {
        statusCounts: statusCounts || [],
        recentRegistrations: recentCount || 0,
        topVendors: topVendors || []
      };
    } catch (error) {
      console.error('Failed to get vendor analytics:', error);
      return {
        statusCounts: [],
        recentRegistrations: 0,
        topVendors: []
      };
    }
  }

  // Export vendors data
  async exportVendors(filters: any = {}): Promise<any[]> {
    try {
      let query = this.supabase
        .from('vendors')
        .select(`
          *,
          vendor_approvals(status, notes, approved_at),
          profiles(full_name, email, phone),
          orders(count)
        `);

      // Apply same filters as getVendors
      if (filters.status) {
        query = query.eq('vendor_approvals.status', filters.status);
      }

      const { data } = await query.order('created_at', { ascending: false });
      return data || [];
    } catch (error) {
      console.error('Failed to export vendors:', error);
      return [];
    }
  }
}

// React hook for vendor management
export function useVendorManagement() {
  const vendorService = new VendorManagementService();
  const [loading, setLoading] = React.useState(false);

  const approveVendor = async (vendorId: string, notes?: string) => {
    setLoading(true);
    try {
      // Get current user (implement based on your auth)
      const currentUserId = 'current-admin-user-id'; // Replace with actual user ID
      await vendorService.approveVendor(vendorId, currentUserId, notes);
    } finally {
      setLoading(false);
    }
  };

  const rejectVendor = async (vendorId: string, notes: string) => {
    setLoading(true);
    try {
      const currentUserId = 'current-admin-user-id';
      await vendorService.rejectVendor(vendorId, currentUserId, notes);
    } finally {
      setLoading(false);
    }
  };

  const suspendVendor = async (vendorId: string, reason: string) => {
    setLoading(true);
    try {
      const currentUserId = 'current-admin-user-id';
      await vendorService.suspendVendor(vendorId, currentUserId, reason);
    } finally {
      setLoading(false);
    }
  };

  const performBulkOperation = async (operation: BulkOperation) => {
    setLoading(true);
    try {
      const currentUserId = 'current-admin-user-id';
      return await vendorService.performBulkOperation(operation, currentUserId);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    approveVendor,
    rejectVendor,
    suspendVendor,
    performBulkOperation,
    getVendors: vendorService.getVendors.bind(vendorService),
    getVendorAnalytics: vendorService.getVendorAnalytics.bind(vendorService),
    exportVendors: vendorService.exportVendors.bind(vendorService)
  };
}
