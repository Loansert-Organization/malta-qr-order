
import { AuditReport } from '@/services/auditService';
import { logSystemEvent } from '@/utils/systemLogs';

export class AuditReportExporter {
  static async exportToCSV(report: AuditReport): Promise<string> {
    const csvHeader = 'Module,Issue ID,Location,Description,Severity,Category,Recommendation,Status,Created At\n';
    
    const csvRows = report.modules.flatMap(module => 
      module.issues.map(issue => 
        [
          module.name,
          issue.id,
          issue.location,
          `"${issue.description.replace(/"/g, '""')}"`,
          issue.severity,
          issue.category,
          `"${issue.recommendation.replace(/"/g, '""')}"`,
          issue.status,
          issue.created_at
        ].join(',')
      )
    ).join('\n');

    const csvContent = csvHeader + csvRows;
    
    await logSystemEvent({
      log_type: 'info',
      component: 'audit_export',
      message: 'Audit report exported to CSV',
      metadata: { 
        reportId: report.id,
        totalIssues: report.summary.totalIssues,
        exportFormat: 'csv'
      }
    });

    return csvContent;
  }

  static async exportToJSON(report: AuditReport): Promise<string> {
    const jsonReport = {
      ...report,
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0',
      compliance: {
        wcag: this.calculateWCAGCompliance(report),
        security: this.calculateSecurityCompliance(report),
        performance: this.calculatePerformanceCompliance(report)
      }
    };

    await logSystemEvent({
      log_type: 'info',
      component: 'audit_export',
      message: 'Audit report exported to JSON',
      metadata: { 
        reportId: report.id,
        totalIssues: report.summary.totalIssues,
        exportFormat: 'json'
      }
    });

    return JSON.stringify(jsonReport, null, 2);
  }

  static downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  static async exportAndDownloadCSV(report: AuditReport) {
    const csvContent = await this.exportToCSV(report);
    const filename = `icupa-audit-report-${report.id}-${new Date().toISOString().split('T')[0]}.csv`;
    this.downloadFile(csvContent, filename, 'text/csv');
  }

  static async exportAndDownloadJSON(report: AuditReport) {
    const jsonContent = await this.exportToJSON(report);
    const filename = `icupa-audit-report-${report.id}-${new Date().toISOString().split('T')[0]}.json`;
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  static generateComplianceReport(report: AuditReport): string {
    const { summary } = report;
    const complianceScore = report.overallScore;
    
    let complianceLevel = 'Non-Compliant';
    if (complianceScore >= 90) complianceLevel = 'Fully Compliant';
    else if (complianceScore >= 75) complianceLevel = 'Mostly Compliant';
    else if (complianceScore >= 60) complianceLevel = 'Partially Compliant';

    return `
# ICUPA Malta Production Readiness Compliance Report

**Report ID:** ${report.id}
**Generated:** ${new Date(report.timestamp).toLocaleString()}
**Overall Score:** ${complianceScore.toFixed(1)}%
**Compliance Level:** ${complianceLevel}

## Executive Summary

This audit assessed the ICUPA Malta platform across ${report.modules.length} critical areas:
- Frontend (React, TypeScript, Accessibility)
- Backend (Database, API, Performance)
- Security (Authentication, RLS, Endpoints)
- Performance (Bundle Size, Memory, Core Web Vitals)

### Issue Breakdown
- **Critical Issues:** ${summary.criticalIssues} (require immediate attention)
- **High Priority:** ${summary.highIssues} (should be resolved soon)
- **Medium Priority:** ${summary.mediumIssues} (recommended improvements)
- **Low Priority:** ${summary.lowIssues} (minor optimizations)

### Module Scores
${report.modules.map(module => 
  `- **${module.name}:** ${module.score}% (${module.issues.length} issues)`
).join('\n')}

## Compliance Standards

### WCAG 2.1 Accessibility
${this.calculateWCAGCompliance(report)}

### Security Standards
${this.calculateSecurityCompliance(report)}

### Performance Standards
${this.calculatePerformanceCompliance(report)}

## Recommendations

### Immediate Actions Required (Critical/High Issues)
${report.modules.flatMap(m => m.issues)
  .filter(i => i.severity === 'critical' || i.severity === 'high')
  .map(i => `- ${i.description}: ${i.recommendation}`)
  .join('\n')}

### Next Steps
1. Address all critical and high-priority issues
2. Implement automated monitoring for continuous compliance
3. Schedule regular security and performance audits
4. Establish accessibility testing in CI/CD pipeline

---
*This report was generated by the ICUPA Malta Automated Audit System*
    `.trim();
  }

  private static calculateWCAGCompliance(report: AuditReport): string {
    const accessibilityIssues = report.modules.flatMap(m => m.issues)
      .filter(i => i.category.includes('accessibility') || i.category.includes('aria') || i.category.includes('contrast'));
    
    const criticalA11yIssues = accessibilityIssues.filter(i => i.severity === 'critical').length;
    
    if (criticalA11yIssues === 0 && accessibilityIssues.length <= 3) {
      return 'WCAG 2.1 AA Compliant (meets accessibility standards)';
    } else if (criticalA11yIssues === 0) {
      return 'WCAG 2.1 A Compliant (basic accessibility standards met)';
    } else {
      return 'Non-Compliant (accessibility issues require resolution)';
    }
  }

  private static calculateSecurityCompliance(report: AuditReport): string {
    const securityIssues = report.modules.flatMap(m => m.issues)
      .filter(i => i.category.includes('security') || i.category.includes('auth') || i.category.includes('rls'));
    
    const criticalSecurityIssues = securityIssues.filter(i => i.severity === 'critical').length;
    
    if (criticalSecurityIssues === 0 && securityIssues.length <= 2) {
      return 'Security Standards Met (OWASP guidelines followed)';
    } else if (criticalSecurityIssues === 0) {
      return 'Basic Security Standards Met (minor improvements needed)';
    } else {
      return 'Security Vulnerabilities Detected (immediate action required)';
    }
  }

  private static calculatePerformanceCompliance(report: AuditReport): string {
    const performanceIssues = report.modules.flatMap(m => m.issues)
      .filter(i => i.category.includes('performance') || i.category.includes('bundle') || i.category.includes('memory'));
    
    const criticalPerfIssues = performanceIssues.filter(i => i.severity === 'critical').length;
    
    if (criticalPerfIssues === 0 && performanceIssues.length <= 3) {
      return 'Performance Standards Met (Core Web Vitals optimized)';
    } else if (criticalPerfIssues === 0) {
      return 'Acceptable Performance (optimization opportunities available)';
    } else {
      return 'Performance Issues Detected (user experience may be impacted)';
    }
  }
}
