
import { ErrorMonitorService } from './ErrorMonitorService';

// Initialize the error monitor
const errorMonitor = ErrorMonitorService.getInstance();

// Auto-initialize when the module loads
if (typeof window !== 'undefined') {
  errorMonitor.initialize();
}

export { errorMonitor, ErrorMonitorService };
export type { ErrorContext, ErrorSeverity } from './types';
