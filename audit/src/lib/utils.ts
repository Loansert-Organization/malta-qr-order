import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-MT', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
}

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-MT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-MT', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function groupBy<T, K extends keyof any>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const group = key(item);
    (groups[group] ||= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

export function calculateRiskScore(likelihood: number, impact: number): number {
  return likelihood * impact;
}

export function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score <= 9) return 'low';
  if (score <= 16) return 'medium';
  return 'high';
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
}

export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ISA compliance helpers
export function formatISAReference(section: string): string {
  return `ISA ${section}`;
}

export function getAuditPhaseOrder(phase: string): number {
  const phases = ['planning', 'fieldwork', 'completion', 'reporting'];
  return phases.indexOf(phase) + 1;
}

export function calculateMaterialityThreshold(
  totalAssets: number,
  method: 'assets' | 'revenue' | 'profit' = 'assets'
): number {
  switch (method) {
    case 'assets':
      return totalAssets * 0.005; // 0.5% of total assets
    case 'revenue':
      return totalAssets * 0.005; // 0.5% of revenue (assuming totalAssets is revenue)
    case 'profit':
      return totalAssets * 0.05; // 5% of profit before tax
    default:
      return totalAssets * 0.005;
  }
}