// Tipos de configuración
export type Environment = 'development' | 'staging' | 'production';

export type ApiConfig = {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  endpoints: {
    actas: string;
    articulos: string;
    historialEstados: string;
    historialGiros: string;
  };
};

export type CacheConfig = {
  defaultTtl: number;
  maxSize: number;
  cleanupInterval: number;
};

export type AppConfig = {
  environment: Environment;
  debug: boolean;
  api: ApiConfig;
  cache: CacheConfig;
  features: {
    enableCache: boolean;
    enableRetry: boolean;
    enableLogging: boolean;
    enableMetrics: boolean;
  };
};

// Configuraciones por ambiente
const configs: Record<Environment, AppConfig> = {
  development: {
    environment: 'development',
    debug: true,
    api: {
      baseUrl: 'https://localhost:44372/v1',
      timeout: 10000,
      retryAttempts: 3,
      endpoints: {
        actas: '/Acta/PorLegajo',
        articulos: '/LegajoArticulo/ById',
        historialEstados: '/legajos/HistorialEstadosPorId',
        historialGiros: '/legajos/HistorialGirosPorId'
      }
    },
    cache: {
      defaultTtl: 5 * 60 * 1000, // 5 minutos
      maxSize: 100,
      cleanupInterval: 10 * 60 * 1000 // 10 minutos
    },
    features: {
      enableCache: true,
      enableRetry: true,
      enableLogging: true,
      enableMetrics: true
    }
  },
  staging: {
    environment: 'staging',
    debug: true,
    api: {
      baseUrl: 'https://staging-api.ieric.com/v1',
      timeout: 15000,
      retryAttempts: 2,
      endpoints: {
        actas: '/Acta/PorLegajo',
        articulos: '/LegajoArticulo/ById',
        historialEstados: '/legajos/HistorialEstadosPorId',
        historialGiros: '/legajos/HistorialGirosPorId'
      }
    },
    cache: {
      defaultTtl: 10 * 60 * 1000, // 10 minutos
      maxSize: 200,
      cleanupInterval: 15 * 60 * 1000 // 15 minutos
    },
    features: {
      enableCache: true,
      enableRetry: true,
      enableLogging: true,
      enableMetrics: true
    }
  },
  production: {
    environment: 'production',
    debug: false,
    api: {
      baseUrl: 'https://api.ieric.com/v1',
      timeout: 20000,
      retryAttempts: 1,
      endpoints: {
        actas: '/Acta/PorLegajo',
        articulos: '/LegajoArticulo/ById',
        historialEstados: '/legajos/HistorialEstadosPorId',
        historialGiros: '/legajos/HistorialGirosPorId'
      }
    },
    cache: {
      defaultTtl: 30 * 60 * 1000, // 30 minutos
      maxSize: 500,
      cleanupInterval: 30 * 60 * 1000 // 30 minutos
    },
    features: {
      enableCache: true,
      enableRetry: false,
      enableLogging: false,
      enableMetrics: true
    }
  }
};

// Clase para manejar la configuración
export class ConfigService {
  private config: AppConfig;
  private environment: Environment;

  constructor(environment: Environment = 'development') {
    this.environment = environment;
    this.config = configs[environment];
  }

  // Obtener la configuración actual
  getConfig(): AppConfig {
    return { ...this.config };
  }

  // Obtener configuración de API
  getApiConfig(): ApiConfig {
    return { ...this.config.api };
  }

  // Obtener configuración de Cache
  getCacheConfig(): CacheConfig {
    return { ...this.config.cache };
  }

  // Obtener una característica específica
  getFeature(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature];
  }

  // Obtener el ambiente actual
  getEnvironment(): Environment {
    return this.environment;
  }

  // Verificar si está en desarrollo
  isDevelopment(): boolean {
    return this.environment === 'development';
  }

  // Verificar si está en producción
  isProduction(): boolean {
    return this.environment === 'production';
  }

  // Verificar si está en staging
  isStaging(): boolean {
    return this.environment === 'staging';
  }

  // Obtener URL base de la API
  getApiBaseUrl(): string {
    return this.config.api.baseUrl;
  }

  // Obtener timeout de la API
  getApiTimeout(): number {
    return this.config.api.timeout;
  }

  // Obtener intentos de retry
  getRetryAttempts(): number {
    return this.config.api.retryAttempts;
  }

  // Obtener TTL por defecto del cache
  getCacheDefaultTtl(): number {
    return this.config.cache.defaultTtl;
  }

  // Obtener tamaño máximo del cache
  getCacheMaxSize(): number {
    return this.config.cache.maxSize;
  }

  // Actualizar configuración (solo en desarrollo)
  updateConfig(newConfig: Partial<AppConfig>): void {
    if (this.isDevelopment()) {
      this.config = { ...this.config, ...newConfig };
      console.log('🔧 Configuración actualizada:', newConfig);
    } else {
      console.warn('⚠️ No se puede actualizar configuración en producción');
    }
  }

  // Resetear configuración a valores por defecto
  resetConfig(): void {
    this.config = { ...configs[this.environment] };
    console.log('🔄 Configuración reseteada');
  }

  // Obtener configuración para logging
  getLoggingConfig(): { enabled: boolean; level: string } {
    return {
      enabled: this.config.features.enableLogging,
      level: this.config.debug ? 'debug' : 'info'
    };
  }
}

// Función para detectar el ambiente automáticamente
function detectEnvironment(): Environment {
  const hostname = window.location.hostname;
  
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return 'development';
  } else if (hostname.includes('staging')) {
    return 'staging';
  } else {
    return 'production';
  }
}

// Instancia singleton del servicio
export const configService = new ConfigService(detectEnvironment());
