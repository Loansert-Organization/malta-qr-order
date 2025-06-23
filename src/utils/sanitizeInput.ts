
/**
 * Input sanitization utility for AI interactions
 * Removes dangerous characters and patterns that could be used for injection attacks
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove dangerous characters and patterns
  return input
    .replace(/[<>{};$`]/g, '') // Remove potential script injection chars
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/data:/gi, '') // Remove data URLs
    .replace(/vbscript:/gi, '') // Remove vbscript
    .trim()
    .slice(0, 1000); // Limit length to prevent oversized inputs
}

/**
 * Sanitize AI prompt specifically
 */
export function sanitizeAIPrompt(prompt: string): string {
  const sanitized = sanitizeInput(prompt);
  
  // Additional AI-specific sanitization
  return sanitized
    .replace(/\b(ignore|forget|override)\s+(previous|all|system)\s+(instructions?|prompts?)\b/gi, '[FILTERED]')
    .replace(/\b(act\s+as|pretend\s+to\s+be|roleplay)\b/gi, '[FILTERED]');
}
