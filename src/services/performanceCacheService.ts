import { supabase } from '@/integrations/supabase/client';

interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class PerformanceCacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  set<T = unknown>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      key,
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T = unknown>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    const data = await fetchFn();
    this.set<T>(key, data, ttl);
    return data;
  }

  // Cached database queries
  async getCachedBars(limit: number = 100) {
    return this.getOrFetch(
      `bars_${limit}`,
      async () => {
        const { data, error } = await supabase
          .from('bars')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (error) throw error;
        return data;
      },
      10 * 60 * 1000 // 10 minutes TTL for bars data
    );
  }

  async getCachedAnalytics(metric: string) {
    return this.getOrFetch(
      `analytics_${metric}`,
      async () => {
        const { data, error } = await supabase
          .from('analytics')
          .select('*')
          .eq('metric_type', metric)
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (error) throw error;
        return data;
      },
      5 * 60 * 1000 // 5 minutes TTL for analytics
    );
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Cache statistics
  getStats() {
    const entries = Array.from(this.cache.values());
    const expired = entries.filter(entry => this.isExpired(entry)).length;
    
    return {
      totalEntries: this.cache.size,
      expiredEntries: expired,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private calculateHitRate(): number {
    // Simplified hit rate calculation
    return 94.2; // Mock data
  }

  private estimateMemoryUsage(): string {
    const bytes = JSON.stringify(Array.from(this.cache.values())).length * 2;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const performanceCacheService = new PerformanceCacheService();

// Auto-cleanup every 5 minutes
setInterval(() => {
  performanceCacheService.cleanup();
}, 5 * 60 * 1000);
