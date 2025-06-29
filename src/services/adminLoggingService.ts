import { supabase } from '@/integrations/supabase/client';

export type AdminActionType = 
  | 'create_bar' | 'update_bar' | 'delete_bar'
  | 'approve_menu' | 'edit_menu_item' | 'delete_menu_item'
  | 'override_order_status' | 'cancel_order'
  | 'export_payments' | 'view_analytics'
  | 'run_ai_tool' | 'update_settings'
  | 'health_check' | 'login' | 'logout';

export type ResourceType = 'bars' | 'menus' | 'orders' | 'payments' | 'system' | 'ai_tools';

interface LogMetadata {
  [key: string]: any;
}

class AdminLoggingService {
  /**
   * Log an admin action to the system_logs table
   */
  async logAction(
    actionType: AdminActionType,
    resourceType: ResourceType,
    resourceId?: string,
    metadata?: LogMetadata,
    status: 'success' | 'error' = 'success',
    errorMessage?: string
  ): Promise<void> {
    try {
      // Get current user info
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No authenticated user for admin logging');
        return;
      }

      // Get user agent and IP (best effort)
      const userAgent = navigator.userAgent;
      
      const { error } = await supabase
        .from('system_logs')
        .insert({
          action_type: actionType,
          admin_id: user.id,
          resource_type: resourceType,
          resource_id: resourceId,
          metadata: metadata || {},
          user_agent: userAgent,
          status,
          error_message: errorMessage
        });

      if (error) {
        console.error('Failed to log admin action:', error);
      }
    } catch (error) {
      console.error('Error in admin logging service:', error);
    }
  }

  /**
   * Log a successful action
   */
  async logSuccess(
    actionType: AdminActionType,
    resourceType: ResourceType,
    resourceId?: string,
    metadata?: LogMetadata
  ): Promise<void> {
    await this.logAction(actionType, resourceType, resourceId, metadata, 'success');
  }

  /**
   * Log a failed action
   */
  async logError(
    actionType: AdminActionType,
    resourceType: ResourceType,
    errorMessage: string,
    resourceId?: string,
    metadata?: LogMetadata
  ): Promise<void> {
    await this.logAction(actionType, resourceType, resourceId, metadata, 'error', errorMessage);
  }

  /**
   * Log bar-related actions
   */
  async logBarAction(
    action: 'create' | 'update' | 'delete',
    barId: string,
    barData?: any
  ): Promise<void> {
    const actionType = `${action}_bar` as AdminActionType;
    await this.logSuccess(actionType, 'bars', barId, { bar: barData });
  }

  /**
   * Log menu moderation actions
   */
  async logMenuAction(
    action: 'approve' | 'edit' | 'delete',
    menuItemId: string,
    menuData?: any
  ): Promise<void> {
    const actionType = action === 'approve' ? 'approve_menu' : 
                      action === 'edit' ? 'edit_menu_item' : 
                      'delete_menu_item';
    await this.logSuccess(actionType, 'menus', menuItemId, { menu_item: menuData });
  }

  /**
   * Log order override actions
   */
  async logOrderAction(
    action: 'override_status' | 'cancel',
    orderId: string,
    oldStatus?: string,
    newStatus?: string,
    amount?: number
  ): Promise<void> {
    const actionType = action === 'override_status' ? 'override_order_status' : 'cancel_order';
    await this.logSuccess(actionType, 'orders', orderId, {
      old_status: oldStatus,
      new_status: newStatus,
      amount
    });
  }

  /**
   * Log payment export
   */
  async logPaymentExport(filters: any, recordCount: number): Promise<void> {
    await this.logSuccess('export_payments', 'payments', undefined, {
      filters,
      record_count: recordCount,
      exported_at: new Date().toISOString()
    });
  }

  /**
   * Log AI tool usage
   */
  async logAIToolUsage(
    toolName: string,
    parameters: any,
    result?: any
  ): Promise<void> {
    await this.logSuccess('run_ai_tool', 'ai_tools', undefined, {
      tool_name: toolName,
      parameters,
      result: result ? 'success' : 'failed'
    });
  }

  /**
   * Get recent admin logs
   */
  async getRecentLogs(limit: number = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('system_logs')
      .select(`
        *,
        admin:admin_id(email)
      `)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching admin logs:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get logs for a specific resource
   */
  async getResourceLogs(resourceType: ResourceType, resourceId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('system_logs')
      .select(`
        *,
        admin:admin_id(email)
      `)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching resource logs:', error);
      return [];
    }

    return data || [];
  }
}

// Export singleton instance
export const adminLogger = new AdminLoggingService(); 