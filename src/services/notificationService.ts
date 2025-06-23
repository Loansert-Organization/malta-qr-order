
import { supabase } from '@/integrations/supabase/client';
import { errorTrackingService } from './errorTrackingService';

export interface NotificationTemplate {
  name: string;
  title: string;
  body: string;
  type: 'email' | 'push' | 'sms' | 'in_app';
  variables?: Record<string, any>;
}

export interface NotificationData {
  userId: string;
  title: string;
  body: string;
  type: 'email' | 'push' | 'sms' | 'in_app';
  data?: Record<string, any>;
  templateId?: string;
}

class NotificationService {
  async createTemplate(template: NotificationTemplate): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .insert({
          name: template.name,
          title: template.title,
          body: template.body,
          type: template.type,
          variables: template.variables || {},
          active: true
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      await errorTrackingService.logError(
        'notification_template_creation_failed',
        error.message,
        'medium',
        { component: 'NotificationService', action: 'createTemplate' }
      );
      throw error;
    }
  }

  async sendNotification(notification: NotificationData): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: notification.userId,
          template_id: notification.templateId || null,
          title: notification.title,
          body: notification.body,
          type: notification.type,
          data: notification.data || {},
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) throw error;

      // For in-app notifications, we can immediately mark as sent
      if (notification.type === 'in_app') {
        await this.markNotificationAsSent(data.id);
      }

      return data.id;
    } catch (error: any) {
      await errorTrackingService.logError(
        'notification_send_failed',
        error.message,
        'high',
        { 
          component: 'NotificationService', 
          action: 'sendNotification',
          additionalData: { notification }
        }
      );
      throw error;
    }
  }

  async markNotificationAsSent(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error: any) {
      await errorTrackingService.logError(
        'notification_status_update_failed',
        error.message,
        'medium',
        { component: 'NotificationService', action: 'markAsSent' }
      );
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error: any) {
      await errorTrackingService.logError(
        'notification_read_update_failed',
        error.message,
        'low',
        { component: 'NotificationService', action: 'markAsRead' }
      );
    }
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<any[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.in('status', ['pending', 'sent', 'delivered']);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error: any) {
      await errorTrackingService.logError(
        'notification_fetch_failed',
        error.message,
        'medium',
        { component: 'NotificationService', action: 'getUserNotifications' }
      );
      return [];
    }
  }

  // Predefined notification helpers for common ICUPA scenarios
  async notifyOrderReceived(vendorUserId: string, orderData: any): Promise<void> {
    await this.sendNotification({
      userId: vendorUserId,
      title: 'New Order Received!',
      body: `New order #${orderData.id} received for €${orderData.total_amount}`,
      type: 'in_app',
      data: {
        orderId: orderData.id,
        amount: orderData.total_amount,
        customerName: orderData.customer_name,
        type: 'order_received'
      }
    });
  }

  async notifyOrderStatusChange(customerUserId: string, orderId: string, newStatus: string): Promise<void> {
    const statusMessages = {
      'preparing': 'Your order is being prepared',
      'ready': 'Your order is ready for pickup!',
      'completed': 'Your order has been completed',
      'cancelled': 'Your order has been cancelled'
    };

    await this.sendNotification({
      userId: customerUserId,
      title: 'Order Status Update',
      body: statusMessages[newStatus as keyof typeof statusMessages] || `Order status: ${newStatus}`,
      type: 'in_app',
      data: {
        orderId,
        status: newStatus,
        type: 'order_status_change'
      }
    });
  }

  async notifyVendorApproval(vendorUserId: string, approved: boolean): Promise<void> {
    await this.sendNotification({
      userId: vendorUserId,
      title: approved ? 'Vendor Application Approved!' : 'Vendor Application Update',
      body: approved 
        ? 'Congratulations! Your vendor application has been approved. You can now start accepting orders.'
        : 'Your vendor application requires additional information. Please check your dashboard.',
      type: 'in_app',
      data: {
        approved,
        type: 'vendor_approval'
      }
    });
  }

  // Real time notification subscription
  subscribeToUserNotifications(userId: string, callback: (notification: any) => void): () => void {
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const notificationService = new NotificationService();
