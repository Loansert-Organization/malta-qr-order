
// This file is kept for backward compatibility
// The actual implementation has been refactored into smaller modules
export { errorMonitor, ErrorMonitorService } from './error-monitor/index';
export type { ErrorContext, ErrorSeverity } from './error-monitor/types';
export default ErrorMonitorService;
