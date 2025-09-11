// Configuración del cache
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos
  MAX_SIZE: 100, // Máximo 100 entradas
  CLEANUP_INTERVAL: 10 * 60 * 1000, // 10 minutos
};

// Tipos para el cache
export type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
};

export type CacheStats = {
  size: number;
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  oldestEntry: number;
  newestEntry: number;
};

// Clase para manejar el cache
export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0
  };
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanup();
  }

  // Iniciar limpieza automática
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, CACHE_CONFIG.CLEANUP_INTERVAL);
  }

  // Detener limpieza automática
  private stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Limpiar entradas expiradas
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cache cleanup: ${cleaned} entradas eliminadas`);
    }
  }

  // Verificar si una clave existe y no ha expirado
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      this.stats.totalRequests++;
      return false;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.totalRequests++;
      return false;
    }

    this.stats.hits++;
    this.stats.totalRequests++;
    entry.accessCount++;
    entry.lastAccessed = now;
    return true;
  }

  // Obtener datos del cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      this.stats.totalRequests++;
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.totalRequests++;
      return null;
    }

    this.stats.hits++;
    this.stats.totalRequests++;
    entry.accessCount++;
    entry.lastAccessed = now;
    return entry.data;
  }

  // Guardar datos en el cache
  set<T>(key: string, data: T, ttl: number = CACHE_CONFIG.DEFAULT_TTL): void {
    // Verificar tamaño máximo
    if (this.cache.size >= CACHE_CONFIG.MAX_SIZE) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    });

    console.log(`💾 Cache set: ${key} (TTL: ${ttl}ms)`);
  }

  // Eliminar entrada específica
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Limpiar todo el cache
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, totalRequests: 0 };
    console.log('🗑️ Cache cleared');
  }

  // Obtener estadísticas del cache
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(entry => entry.timestamp);
    
    return {
      size: this.cache.size,
      hitRate: this.stats.totalRequests > 0 ? this.stats.hits / this.stats.totalRequests : 0,
      missRate: this.stats.totalRequests > 0 ? this.stats.misses / this.stats.totalRequests : 0,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0
    };
  }

  // Obtener tamaño del cache
  size(): number {
    return this.cache.size;
  }

  // Evictar entrada menos usada recientemente
  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`🗑️ Cache evicted: ${oldestKey}`);
    }
  }

  // Obtener todas las claves del cache
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Verificar si el cache está vacío
  isEmpty(): boolean {
    return this.cache.size === 0;
  }

  // Destruir el servicio (limpiar recursos)
  destroy(): void {
    this.stopCleanup();
    this.clear();
  }
}

// Instancia singleton del servicio
export const cacheService = new CacheService();
