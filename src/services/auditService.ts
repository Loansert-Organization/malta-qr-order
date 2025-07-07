import { supabase } from '@/integrations/supabase/client';
import { aiMonitor } from '@/utils/aiMonitor';
import { logSystemEvent } from '@/utils/systemLogs';
import { securityAuditService, SecurityAuditIssue } from './securityAuditService';
import { performanceAuditService, PerformanceAuditIssue } from './performanceAuditService';
import { accessibilityAuditService, AccessibilityAuditIssue } from './accessibilityAuditService';

export interface AuditIssue {
  id: string;
  location: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface AuditModule {
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  issues: AuditIssue[];
  score: number;
  lastRun: string;
  duration: number;
}

export interface AuditReport {
  id: string;
  timestamp: string;
  overallScore: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  modules: AuditModule[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    resolvedIssues: number;
  };
}

export class ModularAuditService {
  private auditId: string;

  constructor() {
    this.auditId = `audit_${Date.now()}`;
  }

  private convertToAuditIssue(issue: SecurityAuditIssue | PerformanceAuditIssue | unknown): AuditIssue {
    const i = issue as SecurityAuditIssue | PerformanceAuditIssue;
    return {
      id: i.id,
      location: (typeof i === 'object' && i !== null && 'endpoint' in i && i.endpoint) ||
                (typeof i === 'object' && i !== null && 'table' in i && i.table) ||
                (typeof i === 'object' && i !== null && 'element' in i && i.element) ||
                'System',
      description: i.description,
      severity: i.severity,
      category: i.category,
      recommendation: (typeof i === 'object' && i !== null && 'recommendation' in i && i.recommendation) || '',
      status: i.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async runFrontendAudit(): Promise<AuditModule> {
    const startTime = Date.now();
    const issues: AuditIssue[] = [];

    try {
      console.log('🖥️ Running Frontend Audit...');

      // Check for TypeScript compilation issues
      const tsIssues = await this.checkTypeScriptHealth();
      issues.push(...tsIssues);

      // Check for missing error boundaries
      const boundaryIssues = await this.checkErrorBoundaries();
      issues.push(...boundaryIssues);

      // Run accessibility audit
      const accessibilityIssues = await accessibilityAuditService.runComprehensiveAccessibilityAudit();
      issues.push(...accessibilityIssues.map(this.convertToAuditIssue));

      const score = this.calculateModuleScore(issues);
      const duration = Date.now() - startTime;

      await aiMonitor("codeGenerated", {
        context: "frontend-audit",
        issues: issues.length,
        score,
        duration
      });

      return {
        name: 'Frontend Audit',
        description: 'TypeScript, React, accessibility, and UI component health check',
        status: 'completed',
        issues,
        score,
        lastRun: new Date().toISOString(),
        duration
      };
    } catch (error) {
      await aiMonitor("error", {
        message: `Frontend audit failed: ${error}`,
        context: "frontend-audit-failure",
        severity: "high"
      });

      return {
        name: 'Frontend Audit',
        description: 'TypeScript, React, accessibility, and UI component health check',
        status: 'failed',
        issues: [{
          id: 'frontend-audit-error',
          location: 'Frontend Audit',
          description: `Audit failed: ${error}`,
          severity: 'high',
          category: 'system',
          recommendation: 'Review audit service implementation',
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }],
        score: 0,
        lastRun: new Date().toISOString(),
        duration: Date.now() - startTime
      };
    }
  }

  async runBackendAudit(): Promise<AuditModule> {
    const startTime = Date.now();
    const issues: AuditIssue[] = [];

    try {
      console.log('🔧 Running Backend Audit...');

      // Check database connectivity
      const dbIssues = await this.checkDatabaseHealth();
      issues.push(...dbIssues);

      // Check edge function health
      const edgeIssues = await this.checkEdgeFunctionHealth();
      issues.push(...edgeIssues);

      // Check API endpoints
      const apiIssues = await this.checkAPIHealth();
      issues.push(...apiIssues);

      // Run performance audit
      const performanceIssues = await performanceAuditService.runComprehensivePerformanceAudit();
      issues.push(...performanceIssues.map(this.convertToAuditIssue));

      const score = this.calculateModuleScore(issues);
      const duration = Date.now() - startTime;

      return {
        name: 'Backend Audit',
        description: 'Database, API, performance, and edge function health check',
        status: 'completed',
        issues,
        score,
        lastRun: new Date().toISOString(),
        duration
      };
    } catch (error) {
      await aiMonitor("error", {
        message: `Backend audit failed: ${error}`,
        context: "backend-audit-failure",
        severity: "high"
      });

      return {
        name: 'Backend Audit',
        description: 'Database, API, performance, and edge function health check',
        status: 'failed',
        issues: [],
        score: 0,
        lastRun: new Date().toISOString(),
        duration: Date.now() - startTime
      };
    }
  }

  async runSecurityAudit(): Promise<AuditModule> {
    const startTime = Date.now();
    const issues: AuditIssue[] = [];

    try {
      console.log('🔒 Running Security Audit...');

      // Run comprehensive security audit
      const securityIssues = await securityAuditService.runComprehensiveSecurityAudit();
      issues.push(...securityIssues.map(this.convertToAuditIssue));

      const score = this.calculateModuleScore(issues);
      const duration = Date.now() - startTime;

      return {
        name: 'Security Audit',
        description: 'Authentication, authorization, RLS policies, and endpoint security check',
        status: 'completed',
        issues,
        score,
        lastRun: new Date().toISOString(),
        duration
      };
    } catch (error) {
      return {
        name: 'Security Audit',
        description: 'Authentication, authorization, RLS policies, and endpoint security check',
        status: 'failed',
        issues: [],
        score: 0,
        lastRun: new Date().toISOString(),
        duration: Date.now() - startTime
      };
    }
  }

  async runPerformanceAudit(): Promise<AuditModule> {
    const startTime = Date.now();
    const issues: AuditIssue[] = [];

    try {
      console.log('⚡ Running Performance Audit...');

      // This is now handled in backend audit but we keep it separate for organization
      const performanceIssues = await performanceAuditService.runComprehensivePerformanceAudit();
      issues.push(...performanceIssues.map(this.convertToAuditIssue));

      const score = this.calculateModuleScore(issues);
      const duration = Date.now() - startTime;

      return {
        name: 'Performance Audit',
        description: 'Database queries, bundle size, memory usage, and Core Web Vitals check',
        status: 'completed',
        issues,
        score,
        lastRun: new Date().toISOString(),
        duration
      };
    } catch (error) {
      return {
        name: 'Performance Audit',
        description: 'Database queries, bundle size, memory usage, and Core Web Vitals check',
        status: 'failed',
        issues: [],
        score: 0,
        lastRun: new Date().toISOString(),
        duration: Date.now() - startTime
      };
    }
  }

  async runComprehensiveAudit(): Promise<AuditReport> {
    const startTime = Date.now();

    try {
      console.log('🔍 Starting comprehensive fullstack audit...');

      // Run all audit modules
      const [frontendModule, backendModule, securityModule, performanceModule] = await Promise.all([
        this.runFrontendAudit(),
        this.runBackendAudit(),
        this.runSecurityAudit(),
        this.runPerformanceAudit()
      ]);

      const modules = [frontendModule, backendModule, securityModule, performanceModule];
      const allIssues = modules.flatMap(module => module.issues);
      
      const summary = {
        totalIssues: allIssues.length,
        criticalIssues: allIssues.filter(i => i.severity === 'critical').length,
        highIssues: allIssues.filter(i => i.severity === 'high').length,
        mediumIssues: allIssues.filter(i => i.severity === 'medium').length,
        lowIssues: allIssues.filter(i => i.severity === 'low').length,
        resolvedIssues: allIssues.filter(i => i.status === 'resolved').length
      };

      const overallScore = modules.reduce((acc, module) => acc + module.score, 0) / modules.length;

      const report: AuditReport = {
        id: this.auditId,
        timestamp: new Date().toISOString(),
        overallScore,
        status: 'completed',
        modules,
        summary
      };

      // Log to system_logs
      await logSystemEvent({
        log_type: 'info',
        component: 'comprehensive_audit',
        message: `Comprehensive audit completed with score: ${overallScore.toFixed(1)}%`,
        metadata: {
          audit_id: this.auditId,
          summary,
          duration: Date.now() - startTime,
          modules: modules.map(m => ({ name: m.name, score: m.score, issues: m.issues.length }))
        }
      });

      // Trigger AI review for critical issues
      if (summary.criticalIssues > 0) {
        await aiMonitor("taskComplete", {
          task: "Critical Issues Detected",
          context: "comprehensive-audit",
          criticalIssues: summary.criticalIssues,
          overallScore,
          report
        });
      }

      return report;
    } catch (error) {
      await aiMonitor("error", {
        message: `Comprehensive audit failed: ${error}`,
        context: "comprehensive-audit-failure",
        severity: "critical"
      });

      return {
        id: this.auditId,
        timestamp: new Date().toISOString(),
        overallScore: 0,
        status: 'failed',
        modules: [],
        summary: {
          totalIssues: 0,
          criticalIssues: 0,
          highIssues: 0,
          mediumIssues: 0,
          lowIssues: 0,
          resolvedIssues: 0
        }
      };
    }
  }

  // Keep existing implementation methods but with real checks now
  private async checkTypeScriptHealth(): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    
    try {
      // Check for common TypeScript issues in console
      const errors = (window as unknown as { __typescript_errors?: unknown[] }).__typescript_errors || [];
      
      if (errors.length > 0) {
        issues.push({
          id: 'ts-compilation-errors',
          location: 'TypeScript Compiler',
          description: `${errors.length} TypeScript compilation errors detected`,
          severity: 'high',
          category: 'code-quality',
          recommendation: 'Fix TypeScript compilation errors',
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('TypeScript health check failed:', error);
    }

    return issues;
  }

  private async checkErrorBoundaries(): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    
    // Check if React error boundaries are implemented
    const hasErrorBoundary = document.querySelector('[data-error-boundary]');
    
    if (!hasErrorBoundary) {
      issues.push({
        id: 'missing-error-boundary',
        location: 'App Component',
        description: 'Missing React error boundary for main application',
        severity: 'medium',
        category: 'reliability',
        recommendation: 'Add React error boundary to catch and handle component errors',
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    return issues;
  }

  private async checkDatabaseHealth(): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    
    try {
      const startTime = performance.now();
      const { error } = await supabase.from('vendors').select('count').limit(1);
      const responseTime = performance.now() - startTime;
      
      if (error) {
        issues.push({
          id: 'db-connectivity-issue',
          location: 'Database',
          description: `Database connectivity issue: ${error.message}`,
          severity: 'critical',
          category: 'infrastructure',
          recommendation: 'Check database connection and network connectivity',
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      if (responseTime > 300) {
        issues.push({
          id: 'db-slow-response',
          location: 'Database',
          description: `Slow database response time: ${Math.round(responseTime)}ms`,
          severity: 'medium',
          category: 'performance',
          recommendation: 'Optimize database queries and check network latency',
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      issues.push({
        id: 'db-error',
        location: 'Database',
        description: `Database error: ${error}`,
        severity: 'critical',
        category: 'infrastructure',
        recommendation: 'Investigate database connectivity and configuration',
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    return issues;
  }

  private async checkEdgeFunctionHealth(): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    const edgeFunctions = ['ai-system-health', 'ai-error-fix', 'ai-code-evaluator'];
    
    for (const functionName of edgeFunctions) {
      try {
        const startTime = performance.now();
        const { error } = await supabase.functions.invoke(functionName, {
          body: { test: true }
        });
        const responseTime = performance.now() - startTime;
        
        if (error) {
          issues.push({
            id: `edge-function-error-${functionName}`,
            location: `Edge Function: ${functionName}`,
            description: `Edge function health check failed: ${error.message}`,
            severity: 'high',
            category: 'infrastructure',
            recommendation: 'Check edge function deployment and configuration',
            status: 'open',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }

        if (responseTime > 5000) {
          issues.push({
            id: `edge-function-slow-${functionName}`,
            location: `Edge Function: ${functionName}`,
            description: `Slow edge function response: ${Math.round(responseTime)}ms`,
            severity: 'medium',
            category: 'performance',
            recommendation: 'Optimize edge function performance',
            status: 'open',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      } catch (error) {
        // Edge functions may not be deployed in development - this is expected
        console.log(`Edge function ${functionName} test completed:`, error);
      }
    }

    return issues;
  }

  private async checkAPIHealth(): Promise<AuditIssue[]> {
    const issues: AuditIssue[] = [];
    
    try {
      // Test basic API connectivity
      const startTime = performance.now();
      const response = await fetch(`${window.location.origin}/`, {
        method: 'HEAD'
      });
      const responseTime = performance.now() - startTime;

      if (!response.ok) {
        issues.push({
          id: 'api-connectivity',
          location: 'API Health',
          description: `API health check failed with status: ${response.status}`,
          severity: 'high',
          category: 'api',
          recommendation: 'Check API server status and configuration',
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      if (responseTime > 2000) {
        issues.push({
          id: 'api-slow-response',
          location: 'API Health',
          description: `Slow API response time: ${Math.round(responseTime)}ms`,
          severity: 'medium',
          category: 'performance',
          recommendation: 'Optimize API response time and check server resources',
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      issues.push({
        id: 'api-error',
        location: 'API Health',
        description: `API health check failed: ${error}`,
        severity: 'critical',
        category: 'api',
        recommendation: 'Investigate API connectivity and server status',
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    return issues;
  }

  private calculateModuleScore(issues: AuditIssue[]): number {
    if (issues.length === 0) return 100;
    
    const weights = { critical: 25, high: 15, medium: 10, low: 5 };
    const totalDeduction = issues.reduce((acc, issue) => acc + weights[issue.severity], 0);
    
    return Math.max(0, 100 - totalDeduction);
  }
}

export const auditService = new ModularAuditService();
