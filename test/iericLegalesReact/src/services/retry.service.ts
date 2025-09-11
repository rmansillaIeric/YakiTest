// Tipos para retry
export type RetryConfig = {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryCondition: (error: any) => boolean;
};

export type RetryResult<T> = {
  success: boolean;
  data?: T;
  error?: any;
  attempts: number;
  totalTime: number;
};

export type RetryOptions = {
  config?: Partial<RetryConfig>;
  onRetry?: (attempt: number, error: any) => void;
  onSuccess?: (data: any, attempts: number) => void;
  onFailure?: (error: any, attempts: number) => void;
};

// Configuración por defecto
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  jitter: true,
  retryCondition: (error) => {
    // Retry en errores de red, timeout, o 5xx
    if (error.name === 'AbortError') return false;
    if (error.status >= 500) return true;
    if (error.message?.includes('timeout')) return true;
    if (error.message?.includes('network')) return true;
    return false;
  }
};

// Clase para manejar retry automático
export class RetryService {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  // Calcular delay con backoff exponencial y jitter
  private calculateDelay(attempt: number): number {
    const exponentialDelay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
    const cappedDelay = Math.min(exponentialDelay, this.config.maxDelay);
    
    if (this.config.jitter) {
      // Agregar jitter para evitar thundering herd
      const jitterAmount = cappedDelay * 0.1;
      const jitter = (Math.random() - 0.5) * 2 * jitterAmount;
      return Math.max(0, cappedDelay + jitter);
    }
    
    return cappedDelay;
  }

  // Ejecutar función con retry
  async execute<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    const finalConfig = { ...this.config, ...options.config };
    let lastError: any;
    let attempts = 0;

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      attempts = attempt;
      
      try {
        const data = await fn();
        
        if (options.onSuccess) {
          options.onSuccess(data, attempts);
        }

        return {
          success: true,
          data,
          attempts,
          totalTime: Date.now() - startTime
        };
      } catch (error) {
        lastError = error;
        
        // Verificar si debemos hacer retry
        if (attempt === finalConfig.maxAttempts || !finalConfig.retryCondition(error)) {
          if (options.onFailure) {
            options.onFailure(error, attempts);
          }
          
          return {
            success: false,
            error,
            attempts,
            totalTime: Date.now() - startTime
          };
        }

        // Notificar intento de retry
        if (options.onRetry) {
          options.onRetry(attempt, error);
        }

        // Calcular delay y esperar
        const delay = this.calculateDelay(attempt);
        await this.delay(delay);
      }
    }

    // Este punto no debería alcanzarse, pero por seguridad
    return {
      success: false,
      error: lastError,
      attempts,
      totalTime: Date.now() - startTime
    };
  }

  // Delay helper
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Método de conveniencia para requests HTTP
  async executeRequest<T>(
    requestFn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    return this.execute(requestFn, {
      ...options,
      config: {
        ...options.config,
        retryCondition: (error) => {
          // Condiciones específicas para requests HTTP
          if (error.name === 'AbortError') return false;
          if (error.status === 429) return true; // Rate limit
          if (error.status >= 500) return true; // Server errors
          if (error.message?.includes('timeout')) return true;
          if (error.message?.includes('network')) return true;
          if (error.message?.includes('fetch')) return true;
          return false;
        }
      }
    });
  }

  // Método para operaciones críticas con retry extendido
  async executeCritical<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    return this.execute(fn, {
      ...options,
      config: {
        maxAttempts: 5,
        baseDelay: 2000,
        maxDelay: 30000,
        ...options.config
      }
    });
  }

  // Método para operaciones rápidas con retry mínimo
  async executeFast<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    return this.execute(fn, {
      ...options,
      config: {
        maxAttempts: 2,
        baseDelay: 500,
        maxDelay: 2000,
        ...options.config
      }
    });
  }

  // Actualizar configuración
  updateConfig(newConfig: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Obtener configuración actual
  getConfig(): RetryConfig {
    return { ...this.config };
  }

  // Crear instancia con configuración específica
  static create(config: Partial<RetryConfig>): RetryService {
    return new RetryService(config);
  }
}

// Instancia singleton del servicio
export const retryService = new RetryService();
