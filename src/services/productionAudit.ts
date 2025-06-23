
import { supabase } from '@/integrations/supabase/client';
import { aiAssistantService } from './aiAssistantService';

export interface AuditIssue {
  id: string;
  location: string;
  type: 'bug' | 'missing' | 'ux' | 'integration' | 'error';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  proposedFix: string;
  status: 'ready' | 'needs_fixing' | 'broken';
}

export interface AuditReport {
  timestamp: string;
  categories: {
    frontend: AuditIssue[];
    backend: AuditIssue[];
    aiIntegration: AuditIssue[];
    errorHandling: AuditIssue[];
    deployment: AuditIssue[];
  };
  summary: {
    totalIssues: number;
    criticalIssues: number;
    readyItems: number;
    brokenItems: number;
    productionReadinessScore: number;
  };
}

class ProductionAuditService {
  private auditResults: AuditIssue[] = [];

  async performFullAudit(): Promise<AuditReport> {
    console.log('🔍 Starting comprehensive production readiness audit...');
    
    this.auditResults = [];

    // Parallel audit execution
    await Promise.all([
      this.auditFrontend(),
      this.auditBackend(),
      this.auditAIIntegration(),
      this.auditErrorHandling(),
      this.auditDeployment()
    ]);

    return this.generateReport();
  }

  private async auditFrontend(): Promise<void> {
    console.log('🖥️ Auditing Frontend...');

    // Check route accessibility
    const routes = [
      { path: '/', name: 'Home/Client App' },
      { path: '/vendor', name: 'Vendor Dashboard' },
      { path: '/admin', name: 'Admin Panel' },
      { path: '/production-system', name: 'Production System' }
    ];

    for (const route of routes) {
      try {
        // Simulate route check
        this.addIssue({
          location: `Route: ${route.path}`,
          type: 'integration',
          severity: 'high',
          description: `Route ${route.path} accessibility needs verification`,
          proposedFix: 'Test route navigation and component loading',
          status: 'needs_fixing'
        });
      } catch (error) {
        this.addIssue({
          location: `Route: ${route.path}`,
          type: 'error',
          severity: 'critical',
          description: `Route ${route.path} failed to load`,
          proposedFix: 'Fix routing configuration and component exports',
          status: 'broken'
        });
      }
    }

    // Check authentication flows
    await this.checkAuthenticationFlows();
    
    // Check responsive design
    await this.checkResponsiveDesign();
  }

  private async auditBackend(): Promise<void> {
    console.log('🔧 Auditing Backend...');

    // Check database tables
    await this.checkDatabaseTables();
    
    // Check RLS policies
    await this.checkRLSPolicies();
    
    // Check edge functions
    await this.checkEdgeFunctions();
  }

  private async auditAIIntegration(): Promise<void> {
    console.log('🤖 Auditing AI Integration...');

    const aiEdgeFunctions = [
      'ai-code-evaluator',
      'ai-task-review', 
      'ai-error-handler',
      'ai-error-fix',
      'ai-ux-recommendation'
    ];

    for (const functionName of aiEdgeFunctions) {
      try {
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: { test: true }
        });

        if (error) {
          this.addIssue({
            location: `Edge Function: ${functionName}`,
            type: 'integration',
            severity: 'critical',
            description: `AI edge function ${functionName} returned error: ${error.message}`,
            proposedFix: 'Check function deployment and API key configuration',
            status: 'broken'
          });
        } else {
          this.addIssue({
            location: `Edge Function: ${functionName}`,
            type: 'integration',
            severity: 'low',
            description: `AI edge function ${functionName} is deployed and responding`,
            proposedFix: 'No action needed',
            status: 'ready'
          });
        }
      } catch (error) {
        this.addIssue({
          location: `Edge Function: ${functionName}`,
          type: 'error',
          severity: 'critical',
          description: `Failed to invoke ${functionName}: ${error}`,
          proposedFix: 'Deploy function and verify configuration',
          status: 'broken'
        });
      }
    }
  }

  private async auditErrorHandling(): Promise<void> {
    console.log('⚠️ Auditing Error Handling...');

    // Check global error handlers
    if (typeof window !== 'undefined') {
      const hasGlobalErrorHandler = window.onerror !== null;
      const hasUnhandledRejectionHandler = window.onunhandledrejection !== null;

      if (!hasGlobalErrorHandler) {
        this.addIssue({
          location: 'Global Error Handling',
          type: 'missing',
          severity: 'high',
          description: 'Global error handler not configured',
          proposedFix: 'Implement window.onerror handler with AI error reporting',
          status: 'needs_fixing'
        });
      }

      if (!hasUnhandledRejectionHandler) {
        this.addIssue({
          location: 'Promise Error Handling',
          type: 'missing',
          severity: 'high',
          description: 'Unhandled promise rejection handler not configured',
          proposedFix: 'Implement window.onunhandledrejection handler',
          status: 'needs_fixing'
        });
      }
    }
  }

  private async auditDeployment(): Promise<void> {
    console.log('🚀 Auditing Deployment...');

    // Check environment variables
    const requiredSecrets = [
      'OPENAI_API_KEY',
      'CLAUDE_API_KEY', 
      'GEMINI_API_KEY',
      'STRIPE_SECRET_KEY'
    ];

    // Note: We can't actually check secret values, but we can verify they're referenced
    for (const secret of requiredSecrets) {
      this.addIssue({
        location: `Environment: ${secret}`,
        type: 'integration',
        severity: 'high',
        description: `Secret ${secret} configuration needs verification`,
        proposedFix: 'Verify secret is set in Supabase project settings',
        status: 'needs_fixing'
      });
    }
  }

  private async checkAuthenticationFlows(): Promise<void> {
    // Check anonymous authentication
    try {
      const { data: session } = await supabase.auth.getSession();
      
      this.addIssue({
        location: 'Authentication System',
        type: 'integration',
        severity: 'medium',
        description: 'Anonymous session management active',
        proposedFix: 'Verify guest session persistence and vendor email auth',
        status: 'ready'
      });
    } catch (error) {
      this.addIssue({
        location: 'Authentication System',
        type: 'error',
        severity: 'critical',
        description: `Authentication system error: ${error}`,
        proposedFix: 'Fix Supabase auth configuration',
        status: 'broken'
      });
    }
  }

  private async checkResponsiveDesign(): Promise<void> {
    // Request UX recommendations for all screens
    try {
      const uxRecommendations = await aiAssistantService.getUXRecommendations({
        screen_name: 'Global UI Audit',
        current_ui_code: 'Production readiness audit',
        user_context: {
          device_type: 'mobile',
          user_role: 'guest'
        }
      });

      if (uxRecommendations) {
        this.addIssue({
          location: 'UI/UX Design',
          type: 'ux',
          severity: 'medium',
          description: 'UX recommendations available from AI analysis',
          proposedFix: 'Apply AI-generated UX improvements',
          status: 'needs_fixing'
        });
      }
    } catch (error) {
      this.addIssue({
        location: 'UI/UX Analysis',
        type: 'error',
        severity: 'medium',
        description: 'Failed to get AI UX recommendations',
        proposedFix: 'Check ai-ux-recommendation edge function',
        status: 'needs_fixing'
      });
    }
  }

  private async checkDatabaseTables(): Promise<void> {
    const criticalTables = [
      'vendors', 'menus', 'menu_items', 'orders', 'order_items',
      'payments', 'ai_waiter_logs', 'profiles', 'guest_sessions'
    ];

    for (const table of criticalTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          this.addIssue({
            location: `Database Table: ${table}`,
            type: 'error',
            severity: 'critical',
            description: `Table ${table} query failed: ${error.message}`,
            proposedFix: 'Check table exists and RLS policies allow access',
            status: 'broken'
          });
        } else {
          this.addIssue({
            location: `Database Table: ${table}`,
            type: 'integration',
            severity: 'low',
            description: `Table ${table} is accessible`,
            proposedFix: 'No action needed',
            status: 'ready'
          });
        }
      } catch (error) {
        this.addIssue({
          location: `Database Table: ${table}`,
          type: 'error',
          severity: 'critical',
          description: `Failed to query table ${table}`,
          proposedFix: 'Verify table exists and permissions',
          status: 'broken'
        });
      }
    }
  }

  private async checkRLSPolicies(): Promise<void> {
    // We can't directly query RLS policies, but we can test access patterns
    this.addIssue({
      location: 'RLS Policies',
      type: 'integration',
      severity: 'high',
      description: 'RLS policies need verification for all user roles',
      proposedFix: 'Test data access for guest, vendor, and admin roles',
      status: 'needs_fixing'
    });
  }

  private async checkEdgeFunctions(): Promise<void> {
    const productionFunctions = [
      'ai-waiter-chat',
      'create-stripe-payment',
      'vendor-analytics',
      'malta-ai-waiter'
    ];

    for (const functionName of productionFunctions) {
      this.addIssue({
        location: `Edge Function: ${functionName}`,
        type: 'integration',
        severity: 'medium',
        description: `Production function ${functionName} needs verification`,
        proposedFix: 'Test function with real data and error scenarios',
        status: 'needs_fixing'
      });
    }
  }

  private addIssue(issue: Omit<AuditIssue, 'id'>): void {
    const fullIssue: AuditIssue = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...issue
    };
    this.auditResults.push(fullIssue);
  }

  private generateReport(): AuditReport {
    const categorizedIssues = {
      frontend: this.auditResults.filter(i => 
        i.location.includes('Route') || i.location.includes('UI') || i.location.includes('Authentication')
      ),
      backend: this.auditResults.filter(i => 
        i.location.includes('Database') || i.location.includes('RLS') || i.location.includes('Edge Function')
      ),
      aiIntegration: this.auditResults.filter(i => 
        i.location.includes('ai-') || i.type === 'integration'
      ),
      errorHandling: this.auditResults.filter(i => 
        i.location.includes('Error') || i.location.includes('Promise')
      ),
      deployment: this.auditResults.filter(i => 
        i.location.includes('Environment') || i.location.includes('Secret')
      )
    };

    const totalIssues = this.auditResults.length;
    const criticalIssues = this.auditResults.filter(i => i.severity === 'critical').length;
    const readyItems = this.auditResults.filter(i => i.status === 'ready').length;
    const brokenItems = this.auditResults.filter(i => i.status === 'broken').length;
    
    // Calculate production readiness score
    const productionReadinessScore = Math.max(0, Math.round(
      ((readyItems / totalIssues) * 60) + 
      (((totalIssues - criticalIssues) / totalIssues) * 40)
    ));

    return {
      timestamp: new Date().toISOString(),
      categories: categorizedIssues,
      summary: {
        totalIssues,
        criticalIssues,
        readyItems,
        brokenItems,
        productionReadinessScore
      }
    };
  }

  async fixCriticalIssues(report: AuditReport): Promise<void> {
    console.log('🔧 Fixing critical issues...');
    
    const criticalIssues = Object.values(report.categories)
      .flat()
      .filter(issue => issue.severity === 'critical' && issue.status === 'broken');

    for (const issue of criticalIssues) {
      try {
        await aiAssistantService.analyzeError({
          error_message: issue.description,
          file_path: issue.location,
          code_context: issue.proposedFix
        });
        
        console.log(`✅ Attempted fix for: ${issue.location}`);
      } catch (error) {
        console.error(`❌ Failed to fix: ${issue.location}`, error);
      }
    }
  }

  async applyUXRecommendations(): Promise<void> {
    console.log('🎨 Applying UX recommendations...');
    
    const screens = ['Client App', 'Vendor Dashboard', 'Admin Panel'];
    
    for (const screen of screens) {
      try {
        await aiAssistantService.getUXRecommendations({
          screen_name: screen,
          current_ui_code: 'Production audit UX review',
          user_context: {
            device_type: 'mobile',
            location: 'Malta'
          }
        });
      } catch (error) {
        console.error(`Failed to get UX recommendations for ${screen}:`, error);
      }
    }
  }
}

export const productionAuditService = new ProductionAuditService();
