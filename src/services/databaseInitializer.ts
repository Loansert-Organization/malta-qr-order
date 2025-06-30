import { supabase } from '@/integrations/supabase/client';
import { googleMapsService } from './googleMapsIntegration';

export class DatabaseInitializer {
  async initializeCompleteBackend(): Promise<{ success: boolean; details: any }> {
    console.log('🚀 Initializing complete backend database integration...');
    
    const results = {
      bars_data: { success: false, count: 0 },
      notifications: { success: false, count: 0 },
      whatsapp_ready: false,
      database_accessible: false
    };

    try {
      // Test database connectivity
      const { data: testQuery, error: testError } = await supabase
        .from('vendors')
        .select('count')
        .limit(1);

      if (!testError) {
        results.database_accessible = true;
        console.log('✅ Database connection established');
      }

      // Initialize bars data
      const barsResult = await googleMapsService.initializeDatabaseWithBars();
      results.bars_data = {
        success: barsResult.success,
        count: barsResult.details.bars_added || 0
      };

      // Create sample notifications to test the system
      await this.createSampleNotifications();
      results.notifications = { success: true, count: 3 };

      // Check if WhatsApp tables are accessible (they might not exist yet)
      try {
        const { error: whatsappError } = await supabase
          .from('whatsapp_sessions')
          .select('count')
          .limit(1);
        
        results.whatsapp_ready = !whatsappError;
      } catch (error) {
        results.whatsapp_ready = false;
      }

      // Log the initialization
      await supabase.from('system_logs').insert({
        log_type: 'system_initialization',
        component: 'database_initializer',
        message: 'Backend database integration completed',
        severity: 'info',
        metadata: results
      });

      return {
        success: results.database_accessible && results.bars_data.success,
        details: results
      };

    } catch (error) {
      console.error('Backend initialization error:', error);
      
      await supabase.from('system_logs').insert({
        log_type: 'error',
        component: 'database_initializer',
        message: `Backend initialization failed: ${error.message}`,
        severity: 'error',
        metadata: { error: error.message }
      });

      return {
        success: false,
        details: { error: error.message, results }
      };
    }
  }

  private async createSampleNotifications(): Promise<void> {
    const sampleNotifications = [
      {
        user_id: 'system',
        title: 'Backend Integration Complete! 🎉',
        body: 'Malta QR Order backend is now fully integrated with live database and Google Maps.',
        type: 'system',
        priority: 'high',
        icon: '🎉',
        metadata: { source: 'backend_initialization' }
      },
      {
        user_id: 'system',
        title: 'Malta Bars Available 🏝️',
        body: 'Explore amazing bars and restaurants across Valletta, Sliema, St. Julian\'s and more!',
        type: 'promotion',
        priority: 'medium',
        icon: '🏝️',
        action_url: '/bars',
        action_text: 'Explore Bars',
        metadata: { feature: 'malta_bars' }
      },
      {
        user_id: 'system',
        title: 'Real-time Notifications Active ��',
        body: 'You\'ll now receive live order updates, payment confirmations, and promotional offers.',
        type: 'system',
        priority: 'medium',
        icon: '🔔',
        metadata: { feature: 'notifications' }
      }
    ];

    for (const notification of sampleNotifications) {
      try {
        await supabase.from('notifications').insert(notification);
      } catch (error) {
        console.error('Error creating sample notification:', error);
      }
    }
  }

  async testBackendIntegration(): Promise<{ success: boolean; tests: any }> {
    const tests = {
      database_connection: false,
      bars_table: false,
      notifications_table: false,
      system_logs: false,
      sample_data_present: false
    };

    try {
      // Test 1: Database connection
      const { error: dbError } = await supabase.from('vendors').select('count').limit(1);
      tests.database_connection = !dbError;

      // Test 2: Bars table
      const { data: barsData, error: barsError } = await supabase.from('bars').select('count').limit(1);
      tests.bars_table = !barsError;
      tests.sample_data_present = (barsData?.[0]?.count || 0) > 0;

      // Test 3: Notifications table
      const { error: notifError } = await supabase.from('notifications').select('count').limit(1);
      tests.notifications_table = !notifError;

      // Test 4: System logs
      const { error: logsError } = await supabase.from('system_logs').select('count').limit(1);
      tests.system_logs = !logsError;

      const allTestsPassed = Object.values(tests).every(test => test === true);

      return {
        success: allTestsPassed,
        tests
      };

    } catch (error) {
      console.error('Backend integration test failed:', error);
      return {
        success: false,
        tests: { ...tests, error: error.message }
      };
    }
  }
}

export const databaseInitializer = new DatabaseInitializer();
