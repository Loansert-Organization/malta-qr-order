
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/utils/systemLogs';

export interface SecurityAuditIssue {
  id: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  recommendation: string;
  status: 'open' | 'resolved';
  endpoint?: string;
  table?: string;
}

export class SecurityAuditService {
  private testUserId = '00000000-0000-0000-0000-000000000002'; // anonymous test user

  async checkRLSPolicies(): Promise<SecurityAuditIssue[]> {
    const issues: SecurityAuditIssue[] = [];
    const sensitiveTablest = [
      'vendors', 'orders', 'payments', 'profiles', 
      'menu_items', 'security_audits', 'system_logs'
    ];

    for (const tableName of sensitiveTablest) {
      try {
        // Test unauthorized access
        const { data, error } = await supabase
          .from(tableName as any)
          .select('*')
          .limit(1);

        // If we get data without proper authentication, RLS is broken
        if (data && data.length > 0 && !error) {
          // Check if this is expected for public tables
          const publicTables = ['vendors', 'menu_items'];
          if (!publicTables.includes(tableName)) {
            issues.push({
              id: `rls-${tableName}`,
              description: `RLS policy failed: ${tableName} is readable by unauthorized users`,
              severity: 'critical',
              category: 'security',
              recommendation: `Enable and configure proper RLS policies for ${tableName} table`,
              status: 'open',
              table: tableName
            });
          }
        }

        // Test for proper error handling on restricted access
        if (error && error.message.includes('row-level security')) {
          console.log(`✅ RLS working correctly for ${tableName}`);
        }

      } catch (error) {
        console.error(`RLS check failed for ${tableName}:`, error);
        
        issues.push({
          id: `rls-error-${tableName}`,
          description: `Failed to test RLS for table ${tableName}: ${error}`,
          severity: 'high',
          category: 'security',
          recommendation: `Investigate RLS configuration for ${tableName}`,
          status: 'open',
          table: tableName
        });
      }
    }

    await logSystemEvent({
      log_type: 'info',
      component: 'security_audit',
      message: `RLS policy check completed. Found ${issues.length} issues`,
      metadata: { issues, tables_checked: sensitiveTablest.length }
    });

    return issues;
  }

  async checkAuthenticationFlows(): Promise<SecurityAuditIssue[]> {
    const issues: SecurityAuditIssue[] = [];

    try {
      // Test session persistence
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        issues.push({
          id: 'auth-session',
          description: 'No active authentication session found',
          severity: 'medium',
          category: 'authentication',
          recommendation: 'Verify authentication state management and session persistence',
          status: 'open'
        });
      }

      // Test token refresh capability
      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          issues.push({
            id: 'auth-refresh',
            description: `Token refresh failed: ${refreshError.message}`,
            severity: 'high',
            category: 'authentication',
            recommendation: 'Fix token refresh mechanism to prevent session expiration issues',
            status: 'open'
          });
        }
      } catch (refreshErr) {
        console.log('Token refresh test completed (expected in some scenarios)');
      }

      // Test password reset flow capability
      try {
        const testEmail = 'security-test@example.com';
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(testEmail, {
          redirectTo: `${window.location.origin}/reset-password`
        });

        // This should either work or fail gracefully
        if (resetError && resetError.message.includes('network')) {
          issues.push({
            id: 'auth-password-reset',
            description: 'Password reset functionality may not be properly configured',
            severity: 'medium',
            category: 'authentication',
            recommendation: 'Verify email service configuration and password reset flow',
            status: 'open'
          });
        }
      } catch (resetErr) {
        console.log('Password reset test completed');
      }

    } catch (error) {
      issues.push({
        id: 'auth-general',
        description: `Authentication flow test failed: ${error}`,
        severity: 'critical',
        category: 'authentication',
        recommendation: 'Investigate authentication service configuration',
        status: 'open'
      });
    }

    await logSystemEvent({
      log_type: 'info',
      component: 'security_audit',
      message: `Authentication flow check completed. Found ${issues.length} issues`,
      metadata: { issues }
    });

    return issues;
  }

  async checkEndpointExposure(): Promise<SecurityAuditIssue[]> {
    const issues: SecurityAuditIssue[] = [];
    const testEndpoints = [
      '/api/health',
      `${window.location.origin}`,
      `${window.location.origin}/vendor`,
      `${window.location.origin}/admin`
    ];

    for (const endpoint of testEndpoints) {
      try {
        // Test CORS headers
        const response = await fetch(endpoint, { 
          method: 'OPTIONS',
          mode: 'cors'
        });

        // Check security headers
        const securityHeaders = {
          'x-content-type-options': 'nosniff',
          'x-frame-options': ['DENY', 'SAMEORIGIN'],
          'x-xss-protection': '1; mode=block',
          'strict-transport-security': 'max-age'
        };

        Object.entries(securityHeaders).forEach(([header, expectedValue]) => {
          const actualValue = response.headers.get(header);
          
          if (!actualValue) {
            issues.push({
              id: `header-${header}-${endpoint}`,
              description: `Missing security header: ${header} on endpoint ${endpoint}`,
              severity: 'medium',
              category: 'api_security',
              recommendation: `Add ${header} header with value: ${expectedValue}`,
              status: 'open',
              endpoint
            });
          } else if (Array.isArray(expectedValue)) {
            if (!expectedValue.some(val => actualValue.toLowerCase().includes(val.toLowerCase()))) {
              issues.push({
                id: `header-value-${header}-${endpoint}`,
                description: `Incorrect ${header} header value on ${endpoint}`,
                severity: 'low',
                category: 'api_security',
                recommendation: `Set ${header} to one of: ${expectedValue.join(', ')}`,
                status: 'open',
                endpoint
              });
            }
          } else if (typeof expectedValue === 'string' && !actualValue.toLowerCase().includes(expectedValue.toLowerCase())) {
            issues.push({
              id: `header-value-${header}-${endpoint}`,
              description: `Incorrect ${header} header value on ${endpoint}`,
              severity: 'low',
              category: 'api_security',
              recommendation: `Set ${header} header to include: ${expectedValue}`,
              status: 'open',
              endpoint
            });
          }
        });

        // Check for information disclosure
        const responseText = await response.text();
        const sensitivePatterns = [
          /api[_-]?key/i,
          /secret/i,
          /password/i,
          /token/i,
          /private[_-]?key/i
        ];

        sensitivePatterns.forEach((pattern, index) => {
          if (pattern.test(responseText)) {
            issues.push({
              id: `info-disclosure-${index}-${endpoint}`,
              description: `Potential sensitive information exposure in response from ${endpoint}`,
              severity: 'high',
              category: 'information_disclosure',
              recommendation: 'Remove sensitive information from public responses',
              status: 'open',
              endpoint
            });
          }
        });

      } catch (error) {
        console.log(`Endpoint test completed for ${endpoint}:`, error);
      }
    }

    await logSystemEvent({
      log_type: 'info',
      component: 'security_audit',
      message: `Endpoint exposure check completed. Found ${issues.length} issues`,
      metadata: { issues, endpoints_tested: testEndpoints.length }
    });

    return issues;
  }

  async runComprehensiveSecurityAudit(): Promise<SecurityAuditIssue[]> {
    console.log('🔒 Starting comprehensive security audit...');
    
    const [rlsIssues, authIssues, endpointIssues] = await Promise.all([
      this.checkRLSPolicies(),
      this.checkAuthenticationFlows(),
      this.checkEndpointExposure()
    ]);

    const allIssues = [...rlsIssues, ...authIssues, ...endpointIssues];

    await logSystemEvent({
      log_type: allIssues.length > 0 ? 'warning' : 'info',
      component: 'security_audit',
      message: `Comprehensive security audit completed. Found ${allIssues.length} total issues`,
      metadata: {
        total_issues: allIssues.length,
        critical_issues: allIssues.filter(i => i.severity === 'critical').length,
        high_issues: allIssues.filter(i => i.severity === 'high').length,
        categories: [...new Set(allIssues.map(i => i.category))]
      }
    });

    return allIssues;
  }
}

export const securityAuditService = new SecurityAuditService();
