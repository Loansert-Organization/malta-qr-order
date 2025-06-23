
import { createClient } from '@supabase/supabase-js';
import React from 'react';

export type NotificationType = 'email' | 'push' | 'sms' | 'in_app';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';

export interface NotificationTemplate {
  name: string;
  title: string;
  body: string;
  type: NotificationType;
  variables?: Record<string, any>;
}

export interface NotificationData {
  userId: string;
  templateName?: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
}

export class NotificationService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Create notification template
  async createTemplate(template: NotificationTemplate): Promise<void> {
    try {
      await this.supabase
        .from('notification_templates')
        .insert(template);
    } catch (error) {
      console.error('Failed to create notification template:', error);
      throw error;
    }
  }

  // Send notification using template
  async sendFromTemplate(
    templateName: string,
    userId: string,
    variables: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Get template
      const { data: template } = await this.supabase
        .from('notification_templates')
        .select('*')
        .eq('name', templateName)
        .eq('active', true)
        .single();

      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      // Replace variables in title and body
      const title = this.replaceVariables(template.title, variables);
      const body = this.replaceVariables(template.body, variables);

      await this.sendNotification({
        userId,
        templateName,
        title,
        body,
        type: template.type,
        data: variables
      });
    } catch (error) {
      console.error('Failed to send notification from template:', error);
      throw error;
    }
  }

  // Send direct notification
  async sendNotification(notification: NotificationData): Promise<string> {
    try {
      // Insert notification record
      const { data: notificationRecord, error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: notification.userId,
          title: notification.title,
          body: notification.body,
          type: notification.type,
          data: notification.data || {},
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Send based on type
      switch (notification.type) {
        case 'in_app':
          await this.sendInAppNotification(notificationRecord);
          break;
        case 'email':
          await this.sendEmailNotification(notificationRecord);
          break;
        case 'push':
          await this.sendPushNotification(notificationRecord);
          break;
        case 'sms':
          await this.sendSMSNotification(notificationRecord);
          break;
      }

      return notificationRecord.id;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  // Send in-app notification via real-time
  private async sendInAppNotification(notification: any): Promise<void> {
    try {
      // Send real-time notification
      await this.supabase.realtime
        .channel(`user:${notification.user_id}`)
        .send({
          type: 'broadcast',
          event: 'notification',
          payload: notification
        });

      // Update status
      await this.updateNotificationStatus(notification.id, 'sent');
    } catch (error) {
      await this.updateNotificationStatus(notification.id, 'failed');
      throw error;
    }
  }

  // Send email notification
  private async sendEmailNotification(notification: any): Promise<void> {
    try {
      // Get user email
      const { data: user } = await this.supabase.auth.admin.getUserById(notification.user_id);
      
      if (!user?.user?.email) {
        throw new Error('User email not found');
      }

      // Use your preferred email service (Resend, SendGrid, etc.)
      if (process.env.RESEND_API_KEY) {
        await this.sendWithResend(user.user.email, notification);
      } else {
        // Fallback to Supabase Edge Function
        await this.supabase.functions.invoke('send-email', {
          body: {
            to: user.user.email,
            subject: notification.title,
            html: this.createEmailHTML(notification)
          }
        });
      }

      await this.updateNotificationStatus(notification.id, 'sent');
    } catch (error) {
      console.error('Email send failed:', error);
      await this.updateNotificationStatus(notification.id, 'failed');
    }
  }

  // Send push notification
  private async sendPushNotification(notification: any): Promise<void> {
    try {
      // Get user's push subscription
      const { data: pushSubscription } = await this.supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', notification.user_id)
        .eq('active', true)
        .single();

      if (!pushSubscription) {
        throw new Error('No active push subscription found');
      }

      // Send via web push or FCM
      await this.sendWebPush(pushSubscription, notification);
      
      await this.updateNotificationStatus(notification.id, 'sent');
    } catch (error) {
      console.error('Push notification failed:', error);
      await this.updateNotificationStatus(notification.id, 'failed');
    }
  }

  // Send SMS notification
  private async sendSMSNotification(notification: any): Promise<void> {
    try {
      // Get user phone number
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('phone')
        .eq('id', notification.user_id)
        .single();

      if (!profile?.phone) {
        throw new Error('User phone number not found');
      }

      // Use Twilio or similar SMS service
      await this.sendSMS(profile.phone, notification.body);
      
      await this.updateNotificationStatus(notification.id, 'sent');
    } catch (error) {
      console.error('SMS send failed:', error);
      await this.updateNotificationStatus(notification.id, 'failed');
    }
  }

  // Update notification status
  private async updateNotificationStatus(
    notificationId: string, 
    status: NotificationStatus
  ): Promise<void> {
    await this.supabase
      .from('notifications')
      .update({ 
        status,
        sent_at: status === 'sent' ? new Date().toISOString() : undefined
      })
      .eq('id', notificationId);
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.supabase
      .from('notifications')
      .update({ 
        status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('user_id', userId);
  }

  // Get user notifications
  async getUserNotifications(
    userId: string, 
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    const { data } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return data || [];
  }

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    const { count } = await this.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .neq('status', 'read');

    return count || 0;
  }

  // Helper methods
  private replaceVariables(text: string, variables: Record<string, any>): string {
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    return result;
  }

  private createEmailHTML(notification: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${notification.title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ICUPA Malta</h1>
            </div>
            <div class="content">
              <h2>${notification.title}</h2>
              <p>${notification.body}</p>
            </div>
            <div class="footer">
              <p>© 2025 ICUPA Malta. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private async sendWithResend(email: string, notification: any): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'ICUPA Malta <noreply@icupa.mt>',
        to: [email],
        subject: notification.title,
        html: this.createEmailHTML(notification)
      })
    });

    if (!response.ok) {
      throw new Error(`Email send failed: ${response.statusText}`);
    }
  }

  private async sendWebPush(subscription: any, notification: any): Promise<void> {
    // Implement web push using web-push library
    const webpush = require('web-push');
    
    webpush.setVapidDetails(
      'mailto:admin@icupa.mt',
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: notification.data
    });

    await webpush.sendNotification(subscription.subscription, payload);
  }

  private async sendSMS(phone: string, message: string): Promise<void> {
    // Implement SMS using Twilio
    if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
      const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
      
      await twilio.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
    }
  }
}

// Predefined notification templates
export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    name: 'order_confirmed',
    title: 'Order Confirmed',
    body: 'Your order #{{orderNumber}} has been confirmed and is being prepared.',
    type: 'in_app'
  },
  {
    name: 'order_ready',
    title: 'Order Ready',
    body: 'Your order #{{orderNumber}} is ready for pickup at {{restaurantName}}.',
    type: 'push'
  },
  {
    name: 'order_delivered',
    title: 'Order Delivered',
    body: 'Your order #{{orderNumber}} has been delivered. Enjoy your meal!',
    type: 'in_app'
  },
  {
    name: 'vendor_approved',
    title: 'Welcome to ICUPA Malta!',
    body: 'Your vendor account has been approved. You can now start receiving orders.',
    type: 'email'
  },
  {
    name: 'payment_received',
    title: 'Payment Received',
    body: 'Payment of €{{amount}} for order #{{orderNumber}} has been processed.',
    type: 'in_app'
  }
];

// React hook for notifications
export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const notificationService = new NotificationService();

  React.useEffect(() => {
    if (!userId) return;

    // Load initial notifications
    loadNotifications();
    loadUnreadCount();

    // Subscribe to real-time notifications
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase.channel(`user:${userId}`)
      .on('broadcast', { event: 'notification' }, (payload) => {
        setNotifications(prev => [payload.payload, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadNotifications = async () => {
    if (!userId) return;
    const data = await notificationService.getUserNotifications(userId);
    setNotifications(data);
  };

  const loadUnreadCount = async () => {
    if (!userId) return;
    const count = await notificationService.getUnreadCount(userId);
    setUnreadCount(count);
  };

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;
    await notificationService.markAsRead(notificationId, userId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, status: 'read' } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    refresh: loadNotifications
  };
}
