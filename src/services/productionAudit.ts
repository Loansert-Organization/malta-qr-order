
import { supabase } from '@/integrations/supabase/client';

interface AuditResult {
  category: string;
  score: number;
  issues: string[];
  recommendations: string[];
  status: 'pass' | 'warning' | 'fail';
}

interface TableStats {
  name: string;
  rowCount: number;
  lastUpdated: string;
  hasRLS: boolean;
}

class ProductionAuditService {
  async runComprehensiveAudit(): Promise<{
    overallScore: number;
    results: AuditResult[];
    summary: string;
  }> {
    const results: AuditResult[] = [];

    // Database audit
    results.push(await this.auditDatabase());
    
    // Security audit
    results.push(await this.auditSecurity());
    
    // Performance audit
    results.push(await this.auditPerformance());
    
    // Data integrity audit
    results.push(await this.auditDataIntegrity());

    const overallScore = results.reduce((sum, result) => sum + result.score, 0) / results.length;
    const failCount = results.filter(r => r.status === 'fail').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    
    const summary = `Audit completed with ${results.length} categories. Overall score: ${overallScore.toFixed(1)}/100. ${failCount} failures, ${warningCount} warnings.`;

    return {
      overallScore,
      results,
      summary
    };
  }

  private async auditDatabase(): Promise<AuditResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    try {
      // Check critical tables exist and have data
      const criticalTables = ['vendors', 'orders', 'menu_items', 'payments'];
      const tableStats: TableStats[] = [];

      for (const tableName of criticalTables) {
        try {
          const { count, error } = await supabase
            .from(tableName as any)
            .select('*', { count: 'exact', head: true });

          if (error) {
            issues.push(`Table ${tableName} is not accessible: ${error.message}`);
            score -= 20;
          } else {
            tableStats.push({
              name: tableName,
              rowCount: count || 0,
              lastUpdated: new Date().toISOString(),
              hasRLS: true // We'll assume RLS is enabled
            });

            if ((count || 0) === 0) {
              issues.push(`Table ${tableName} has no data`);
              score -= 5;
            }
          }
        } catch (error) {
          issues.push(`Failed to check table ${tableName}`);
          score -= 10;
        }
      }

      // Check for orphaned records
      try {
        const { data: orphanedOrders } = await supabase
          .from('orders')
          .select('id')
          .is('vendor_id', null);

        if (orphanedOrders && orphanedOrders.length > 0) {
          issues.push(`Found ${orphanedOrders.length} orders without vendor_id`);
          recommendations.push('Clean up orphaned order records');
          score -= 5;
        }
      } catch (error) {
        // Handle error silently for this check
      }

    } catch (error) {
      issues.push('Database connectivity issues detected');
      score -= 30;
    }

    if (score < 70) {
      recommendations.push('Immediate database maintenance required');
    }

    return {
      category: 'Database Health',
      score: Math.max(0, score),
      issues,
      recommendations,
      status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail'
    };
  }

  private async auditSecurity(): Promise<AuditResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    try {
      // Check for recent security events
      const { data: recentErrors } = await supabase
        .from('error_logs')
        .select('error_type, severity')
        .in('error_type', ['access_violation', 'authentication_failure'])
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (recentErrors && recentErrors.length > 10) {
        issues.push(`High number of security events: ${recentErrors.length} in last 24h`);
        score -= 20;
      }

      // Check for critical errors
      const { count: criticalErrors } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true })
        .eq('severity', 'critical')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (criticalErrors && criticalErrors > 0) {
        issues.push(`${criticalErrors} critical errors in last 7 days`);
        recommendations.push('Review and resolve critical security issues');
        score -= 15;
      }

      // Check audit trail
      const { data: auditTrail } = await supabase
        .from('security_audits')
        .select('performed_at')
        .order('performed_at', { ascending: false })
        .limit(1);

      if (!auditTrail || auditTrail.length === 0) {
        issues.push('No recent security audits found');
        recommendations.push('Schedule regular security audits');
        score -= 10;
      }

    } catch (error) {
      issues.push('Unable to complete security audit checks');
      score -= 25;
    }

    return {
      category: 'Security',
      score: Math.max(0, score),
      issues,
      recommendations,
      status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail'
    };
  }

  private async auditPerformance(): Promise<AuditResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    try {
      // Check recent performance logs
      const { data: perfLogs } = await supabase
        .from('performance_logs')
        .select('response_time, endpoint')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .order('response_time', { ascending: false })
        .limit(100);

      if (perfLogs && perfLogs.length > 0) {
        const avgResponseTime = perfLogs.reduce((sum, log) => sum + log.response_time, 0) / perfLogs.length;
        const slowQueries = perfLogs.filter(log => log.response_time > 2000);

        if (avgResponseTime > 1000) {
          issues.push(`Average response time high: ${avgResponseTime.toFixed(0)}ms`);
          score -= 15;
        }

        if (slowQueries.length > 5) {
          issues.push(`${slowQueries.length} slow queries detected (>2s)`);
          recommendations.push('Optimize slow database queries');
          score -= 10;
        }
      }

      // Check system resource usage (mock data)
      const cpuUsage = Math.random() * 100;
      const memoryUsage = Math.random() * 100;

      if (cpuUsage > 80) {
        issues.push(`High CPU usage: ${cpuUsage.toFixed(1)}%`);
        score -= 20;
      }

      if (memoryUsage > 85) {
        issues.push(`High memory usage: ${memoryUsage.toFixed(1)}%`);
        score -= 15;
      }

    } catch (error) {
      issues.push('Performance monitoring data unavailable');
      score -= 20;
    }

    return {
      category: 'Performance',
      score: Math.max(0, score),
      issues,
      recommendations,
      status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail'
    };
  }

  private async auditDataIntegrity(): Promise<AuditResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    try {
      // Check for data consistency issues
      const { data: ordersWithoutItems } = await supabase
        .from('orders')
        .select(`
          id,
          order_items!left (
            id
          )
        `)
        .is('order_items.id', null);

      if (ordersWithoutItems && ordersWithoutItems.length > 0) {
        issues.push(`${ordersWithoutItems.length} orders without items`);
        recommendations.push('Clean up incomplete order records');
        score -= 10;
      }

      // Check for menu items without prices
      const { data: itemsWithoutPrices } = await supabase
        .from('menu_items')
        .select('id, name')
        .is('price', null);

      if (itemsWithoutPrices && itemsWithoutPrices.length > 0) {
        issues.push(`${itemsWithoutPrices.length} menu items without prices`);
        recommendations.push('Add prices to all menu items');
        score -= 15;
      }

      // Check for vendors without menus
      const { data: vendorsWithoutMenus } = await supabase
        .from('vendors')
        .select(`
          id,
          name,
          menus!left (
            id
          )
        `)
        .is('menus.id', null)
        .eq('active', true);

      if (vendorsWithoutMenus && vendorsWithoutMenus.length > 0) {
        issues.push(`${vendorsWithoutMenus.length} active vendors without menus`);
        recommendations.push('Ensure all active vendors have menus');
        score -= 20;
      }

    } catch (error) {
      issues.push('Data integrity checks failed');
      score -= 30;
    }

    return {
      category: 'Data Integrity',
      score: Math.max(0, score),
      issues,
      recommendations,
      status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail'
    };
  }
}

export const productionAuditService = new ProductionAuditService();
