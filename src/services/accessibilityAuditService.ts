
import { logSystemEvent } from '@/utils/systemLogs';

export interface AccessibilityAuditIssue {
  id: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  recommendation: string;
  status: 'open' | 'resolved';
  element?: string;
  wcagLevel?: 'A' | 'AA' | 'AAA';
}

export class AccessibilityAuditService {
  async checkKeyboardNavigation(): Promise<AccessibilityAuditIssue[]> {
    const issues: AccessibilityAuditIssue[] = [];

    try {
      // Check for focusable elements without proper tab order
      const focusableElements = document.querySelectorAll(
        'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
      );

      focusableElements.forEach((element, index) => {
        const tabIndex = element.getAttribute('tabindex');
        
        // Check for positive tabindex (anti-pattern)
        if (tabIndex && parseInt(tabIndex) > 0) {
          issues.push({
            id: `tabindex-positive-${index}`,
            description: 'Positive tabindex detected - breaks natural tab flow',
            severity: 'medium',
            category: 'keyboard_navigation',
            recommendation: 'Use tabindex="0" or rely on natural DOM order for tab navigation',
            status: 'open',
            element: element.tagName.toLowerCase(),
            wcagLevel: 'A'
          });
        }

        // Check for missing focus indicators
        const styles = window.getComputedStyle(element, ':focus');
        const outlineStyle = styles.outline;
        const outlineWidth = styles.outlineWidth;
        
        if (outlineStyle === 'none' || outlineWidth === '0px') {
          issues.push({
            id: `focus-indicator-${index}`,
            description: 'Focusable element lacks visible focus indicator',
            severity: 'high',
            category: 'keyboard_navigation',
            recommendation: 'Add visible focus indicators using CSS :focus pseudo-class',
            status: 'open',
            element: element.tagName.toLowerCase(),
            wcagLevel: 'AA'
          });
        }
      });

      // Check for keyboard traps
      const modalElements = document.querySelectorAll('[role="dialog"], .modal, [aria-modal="true"]');
      modalElements.forEach((modal, index) => {
        const focusableInModal = modal.querySelectorAll(
          'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableInModal.length === 0) {
          issues.push({
            id: `keyboard-trap-${index}`,
            description: 'Modal or dialog lacks focusable elements - potential keyboard trap',
            severity: 'critical',
            category: 'keyboard_navigation',
            recommendation: 'Ensure modals contain focusable elements and implement proper focus management',
            status: 'open',
            element: 'modal',
            wcagLevel: 'A'
          });
        }
      });

    } catch (error) {
      console.error('Keyboard navigation check failed:', error);
    }

    return issues;
  }

  async checkAriaLabeling(): Promise<AccessibilityAuditIssue[]> {
    const issues: AccessibilityAuditIssue[] = [];

    try {
      // Check form inputs without labels
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input, index) => {
        const id = input.getAttribute('id');
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;

        if (!label && !ariaLabel && !ariaLabelledBy) {
          issues.push({
            id: `unlabeled-input-${index}`,
            description: 'Form input lacks accessible label',
            severity: 'high',
            category: 'aria_labeling',
            recommendation: 'Add a label element, aria-label, or aria-labelledby attribute',
            status: 'open',
            element: input.tagName.toLowerCase(),
            wcagLevel: 'A'
          });
        }
      });

      // Check buttons without accessible names
      const buttons = document.querySelectorAll('button');
      buttons.forEach((button, index) => {
        const text = button.textContent?.trim();
        const ariaLabel = button.getAttribute('aria-label');
        const ariaLabelledBy = button.getAttribute('aria-labelledby');

        if (!text && !ariaLabel && !ariaLabelledBy) {
          issues.push({
            id: `unlabeled-button-${index}`,
            description: 'Button lacks accessible name',
            severity: 'high',
            category: 'aria_labeling',
            recommendation: 'Add text content, aria-label, or aria-labelledby attribute to button',
            status: 'open',
            element: 'button',
            wcagLevel: 'A'
          });
        }
      });

      // Check images without alt text
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        const alt = img.getAttribute('alt');
        const role = img.getAttribute('role');

        if (alt === null && role !== 'presentation') {
          issues.push({
            id: `missing-alt-${index}`,
            description: 'Image lacks alt attribute',
            severity: 'medium',
            category: 'aria_labeling',
            recommendation: 'Add descriptive alt text or role="presentation" for decorative images',
            status: 'open',
            element: 'img',
            wcagLevel: 'A'
          });
        }
      });

      // Check landmarks and headings structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let h1Count = 0;
      let lastLevel = 0;

      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        
        if (level === 1) h1Count++;
        
        if (level > lastLevel + 1) {
          issues.push({
            id: `heading-skip-${index}`,
            description: `Heading level skipped: ${heading.tagName} follows h${lastLevel}`,
            severity: 'medium',
            category: 'aria_labeling',
            recommendation: 'Use heading levels sequentially (h1, h2, h3, etc.)',
            status: 'open',
            element: heading.tagName.toLowerCase(),
            wcagLevel: 'AA'
          });
        }
        
        lastLevel = level;
      });

      if (h1Count === 0) {
        issues.push({
          id: 'missing-h1',
          description: 'Page lacks main heading (h1)',
          severity: 'medium',
          category: 'aria_labeling',
          recommendation: 'Add a descriptive h1 heading to identify the main content',
          status: 'open',
          element: 'h1',
          wcagLevel: 'AA'
        });
      } else if (h1Count > 1) {
        issues.push({
          id: 'multiple-h1',
          description: 'Multiple h1 headings found on page',
          severity: 'low',
          category: 'aria_labeling',
          recommendation: 'Consider using only one h1 per page for better structure',
          status: 'open',
          element: 'h1',
          wcagLevel: 'AA'
        });
      }

    } catch (error) {
      console.error('ARIA labeling check failed:', error);
    }

    return issues;
  }

  async checkColorContrast(): Promise<AccessibilityAuditIssue[]> {
    const issues: AccessibilityAuditIssue[] = [];

    try {
      // Get all text elements
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label');
      
      textElements.forEach((element, index) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        const fontSize = parseFloat(styles.fontSize);
        
        // Simple contrast check (would need a proper color contrast calculator in production)
        if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          // This is a simplified check - in production, use a proper contrast ratio calculator
          const isLargeText = fontSize >= 18 || (fontSize >= 14 && styles.fontWeight === 'bold');
          
          // For demo purposes, flag potential contrast issues
          if (color === backgroundColor) {
            issues.push({
              id: `contrast-issue-${index}`,
              description: 'Text color matches background color - no contrast',
              severity: 'critical',
              category: 'color_contrast',
              recommendation: 'Ensure sufficient color contrast between text and background (4.5:1 for normal text, 3:1 for large text)',
              status: 'open',
              element: element.tagName.toLowerCase(),
              wcagLevel: 'AA'
            });
          }
        }
      });

      // Check for color-only information
      const colorOnlyElements = document.querySelectorAll('[style*="color:red"], .text-red, .error, .success, .warning');
      if (colorOnlyElements.length > 0) {
        issues.push({
          id: 'color-only-info',
          description: 'Information may be conveyed by color alone',
          severity: 'medium',
          category: 'color_contrast',
          recommendation: 'Supplement color with text, icons, or patterns to convey information',
          status: 'open',
          wcagLevel: 'A'
        });
      }

    } catch (error) {
      console.error('Color contrast check failed:', error);
    }

    return issues;
  }

  async checkScreenReaderCompatibility(): Promise<AccessibilityAuditIssue[]> {
    const issues: AccessibilityAuditIssue[] = [];

    try {
      // Check for proper semantic markup
      const semanticElements = document.querySelectorAll('main, nav, aside, section, article, header, footer');
      if (semanticElements.length === 0) {
        issues.push({
          id: 'missing-landmarks',
          description: 'Page lacks semantic landmarks',
          severity: 'medium',
          category: 'screen_reader',
          recommendation: 'Use semantic HTML5 elements (main, nav, aside, section, article, header, footer)',
          status: 'open',
          wcagLevel: 'AA'
        });
      }

      // Check for skip links
      const skipLinks = document.querySelectorAll('a[href^="#"], a[href*="skip"]');
      if (skipLinks.length === 0) {
        issues.push({
          id: 'missing-skip-links',
          description: 'Page lacks skip navigation links',
          severity: 'medium',
          category: 'screen_reader',
          recommendation: 'Add skip links to allow users to bypass repetitive navigation',
          status: 'open',
          wcagLevel: 'A'
        });
      }

      // Check for proper list markup
      const fakeListsers = document.querySelectorAll('div:has(> div), span:has(> span)');
      // This is a simplified check - would need more sophisticated detection
      
      // Check for table headers
      const tables = document.querySelectorAll('table');
      tables.forEach((table, index) => {
        const headers = table.querySelectorAll('th');
        const rows = table.querySelectorAll('tr');
        
        if (rows.length > 1 && headers.length === 0) {
          issues.push({
            id: `table-headers-${index}`,
            description: 'Data table lacks proper header cells',
            severity: 'high',
            category: 'screen_reader',
            recommendation: 'Use <th> elements for table headers and consider scope attributes',
            status: 'open',
            element: 'table',
            wcagLevel: 'A'
          });
        }
      });

      // Check for live regions where appropriate
      const dynamicContent = document.querySelectorAll('[id*="status"], [id*="alert"], [class*="notification"]');
      dynamicContent.forEach((element, index) => {
        const ariaLive = element.getAttribute('aria-live');
        const role = element.getAttribute('role');
        
        if (!ariaLive && !role) {
          issues.push({
            id: `missing-live-region-${index}`,
            description: 'Dynamic content lacks live region announcement',
            severity: 'low',
            category: 'screen_reader',
            recommendation: 'Add aria-live attribute or appropriate role for dynamic content updates',
            status: 'open',
            wcagLevel: 'AA'
          });
        }
      });

    } catch (error) {
      console.error('Screen reader compatibility check failed:', error);
    }

    return issues;
  }

  async runComprehensiveAccessibilityAudit(): Promise<AccessibilityAuditIssue[]> {
    console.log('♿ Starting comprehensive accessibility audit...');
    
    const [keyboardIssues, ariaIssues, contrastIssues, screenReaderIssues] = await Promise.all([
      this.checkKeyboardNavigation(),
      this.checkAriaLabeling(),
      this.checkColorContrast(),
      this.checkScreenReaderCompatibility()
    ]);

    const allIssues = [...keyboardIssues, ...ariaIssues, ...contrastIssues, ...screenReaderIssues];

    await logSystemEvent({
      log_type: allIssues.length > 0 ? 'warning' : 'info',
      component: 'accessibility_audit',
      message: `Comprehensive accessibility audit completed. Found ${allIssues.length} total issues`,
      metadata: {
        total_issues: allIssues.length,
        critical_issues: allIssues.filter(i => i.severity === 'critical').length,
        high_issues: allIssues.filter(i => i.severity === 'high').length,
        wcag_levels: [...new Set(allIssues.map(i => i.wcagLevel).filter(Boolean))],
        categories: [...new Set(allIssues.map(i => i.category))]
      }
    });

    return allIssues;
  }
}

export const accessibilityAuditService = new AccessibilityAuditService();
