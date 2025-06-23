
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  success?: boolean;
  additionalData?: Record<string, any>;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorData {
  type: string;
  message: string;
  stack?: string;
  context?: any;
  filename?: string;
  lineno?: number;
  colno?: number;
}
