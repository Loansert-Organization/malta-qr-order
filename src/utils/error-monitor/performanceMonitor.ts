
import type { ErrorData } from './types';

export const setupPerformanceMonitoring = (handleError: (errorData: ErrorData) => Promise<void>) => {
  // Monitor page load performance
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
    
    if (loadTime > 3000) { // Slow load threshold
      handleError({
        type: 'performance_issue',
        message: `Slow page load detected: ${loadTime}ms`,
        context: { loadTime, perfData }
      });
    }
  });
};
