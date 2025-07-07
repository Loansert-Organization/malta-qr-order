// ✨ Type Utilities for ICUPA PWA - Eliminate all 'any' types
import { z } from 'zod';

// =============================================================================
// TYPE GUARDS & VALIDATORS
// =============================================================================

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

// =============================================================================
// SAFE TYPE CONVERSIONS
// =============================================================================

export function safeString(value: unknown, defaultValue = ''): string {
  if (isString(value)) return value;
  if (isNumber(value)) return String(value);
  if (isBoolean(value)) return String(value);
  return defaultValue;
}

export function safeNumber(value: unknown, defaultValue = 0): number {
  if (isNumber(value)) return value;
  if (isString(value)) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

export function safeBoolean(value: unknown, defaultValue = false): boolean {
  if (isBoolean(value)) return value;
  if (isString(value)) {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === '1' || lower === 'yes';
  }
  if (isNumber(value)) return value !== 0;
  return defaultValue;
}

export function safeObject<T extends Record<string, unknown>>(
  value: unknown,
  defaultValue: T
): T {
  if (isObject(value)) return value as T;
  return defaultValue;
}

export function safeArray<T>(value: unknown, defaultValue: T[] = []): T[] {
  if (isArray(value)) return value as T[];
  return defaultValue;
}

// =============================================================================
// ERROR HANDLING TYPES
// =============================================================================

export interface SafeResult<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

export function createSafeResult<T, E = Error>(
  success: boolean,
  data?: T,
  error?: E
): SafeResult<T, E> {
  return { success, data, error };
}

export function safeResult<T, E = Error>(
  fn: () => T | Promise<T>
): Promise<SafeResult<T, E>> {
  return Promise.resolve()
    .then(() => fn())
    .then((data) => createSafeResult<T, E>(true, data))
    .catch((error) => createSafeResult<T, E>(false, undefined, error));
}

// =============================================================================
// API RESPONSE HANDLING
// =============================================================================

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function createApiResult<T>(
  data: T | null = null,
  error: string | null = null,
  loading = false
): ApiResult<T> {
  return { data, error, loading };
}

// =============================================================================
// FORM HANDLING TYPES
// =============================================================================

export interface FormField<T = unknown> {
  value: T;
  error?: string;
  touched: boolean;
  required?: boolean;
}

export interface FormState<T extends Record<string, unknown>> {
  fields: Record<keyof T, FormField<T[keyof T]>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

export function createFormField<T>(
  value: T,
  required = false
): FormField<T> {
  return {
    value,
    touched: false,
    required,
  };
}

// =============================================================================
// EVENT HANDLER TYPES
// =============================================================================

export type EventHandler<T = Event> = (event: T) => void | Promise<void>;

export type ClickHandler = EventHandler<React.MouseEvent<HTMLElement>>;
export type ChangeHandler = EventHandler<React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>>;
export type SubmitHandler = EventHandler<React.FormEvent<HTMLFormElement>>;
export type KeyboardHandler = EventHandler<React.KeyboardEvent<HTMLElement>>;

// =============================================================================
// ASYNC HANDLER TYPES
// =============================================================================

export type AsyncHandler<T = unknown> = (data: T) => Promise<void>;
export type AsyncErrorHandler = (error: Error) => Promise<void> | void;
export type AsyncSuccessHandler<T = unknown> = (data: T) => Promise<void> | void;

// =============================================================================
// REACT HOOK TYPES
// =============================================================================

export interface UseStateResult<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
}

export interface UseAsyncResult<T, E = Error> {
  data: T | null;
  error: E | null;
  loading: boolean;
  execute: () => Promise<void>;
  reset: () => void;
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

export const emailSchema = z.string().email('Invalid email address');
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number');
export const urlSchema = z.string().url('Invalid URL');
export const positiveNumberSchema = z.number().positive('Must be a positive number');
export const nonEmptyStringSchema = z.string().min(1, 'Cannot be empty');

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonNullable<T> = T extends null | undefined ? never : T;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

export type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};

// =============================================================================
// CONSTANTS
// =============================================================================

export const EMPTY_OBJECT = {} as const;
export const EMPTY_ARRAY = [] as const;
export const EMPTY_STRING = '' as const;
export const ZERO = 0 as const;
export const FALSE = false as const;
export const TRUE = true as const;

// =============================================================================
// TYPE ASSERTIONS (SAFE)
// =============================================================================

export function assertIsString(value: unknown, message?: string): asserts value is string {
  if (!isString(value)) {
    throw new Error(message || `Expected string, got ${typeof value}`);
  }
}

export function assertIsNumber(value: unknown, message?: string): asserts value is number {
  if (!isNumber(value)) {
    throw new Error(message || `Expected number, got ${typeof value}`);
  }
}

export function assertIsBoolean(value: unknown, message?: string): asserts value is boolean {
  if (!isBoolean(value)) {
    throw new Error(message || `Expected boolean, got ${typeof value}`);
  }
}

export function assertIsObject(value: unknown, message?: string): asserts value is Record<string, unknown> {
  if (!isObject(value)) {
    throw new Error(message || `Expected object, got ${typeof value}`);
  }
}

export function assertIsArray(value: unknown, message?: string): asserts value is unknown[] {
  if (!isArray(value)) {
    throw new Error(message || `Expected array, got ${typeof value}`);
  }
}

// =============================================================================
// DEPRECATED TYPE REPLACEMENTS
// =============================================================================

// Replace 'any' with these specific types
export type UnknownRecord = Record<string, unknown>;
export type UnknownFunction = (...args: unknown[]) => unknown;
export type UnknownArray = unknown[];
export type UnknownValue = unknown;

// =============================================================================
// EXPORT ALL UTILITIES
// =============================================================================

export default {
  // Type guards
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isFunction,
  isDate,
  isError,
  
  // Safe conversions
  safeString,
  safeNumber,
  safeBoolean,
  safeObject,
  safeArray,
  
  // Result types
  createSafeResult,
  safeResult,
  createApiResult,
  
  // Form types
  createFormField,
  
  // Constants
  EMPTY_OBJECT,
  EMPTY_ARRAY,
  EMPTY_STRING,
  ZERO,
  FALSE,
  TRUE,
  
  // Assertions
  assertIsString,
  assertIsNumber,
  assertIsBoolean,
  assertIsObject,
  assertIsArray,
}; 