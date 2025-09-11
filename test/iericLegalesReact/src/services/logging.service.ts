// Tipos para logging
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
  stack?: string;
};

export type LoggingConfig = {
  enabled: boolean;
  level: LogLevel;
  maxEntries: number;
  enableConsole: boolean;
  enableStorage: boolean;
  enableMetrics: boolean;
};

// Clase para manejar logging
export class LoggingService {
  private config: LoggingConfig;
  private logs: LogEntry[] = [];
  private metrics = {
    totalLogs: 0,
    logsByLevel: {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0
    }
  };

  constructor(config: LoggingConfig) {
    this.config = config;
  }

  // Verificar si un nivel debe ser loggeado
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  // Método principal de logging
  private log(level: LogLevel, message: string, context?: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      data,
      stack: level === 'error' ? new Error().stack : undefined
    };

    // Agregar a logs en memoria
    this.logs.push(entry);
    this.metrics.totalLogs++;
    this.metrics.logsByLevel[level]++;

    // Limitar tamaño de logs
    if (this.logs.length > this.config.maxEntries) {
      this.logs.shift();
    }

    // Log a consola
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Log a storage
    if (this.config.enableStorage) {
      this.logToStorage(entry);
    }
  }

  // Log a consola con colores
  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const context = entry.context ? `[${entry.context}]` : '';
    const message = `${timestamp} ${context} ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(`🐛 ${message}`, entry.data);
        break;
      case 'info':
        console.info(`ℹ️ ${message}`, entry.data);
        break;
      case 'warn':
        console.warn(`⚠️ ${message}`, entry.data);
        break;
      case 'error':
        console.error(`❌ ${message}`, entry.data, entry.stack);
        break;
    }
  }

  // Log a storage local
  private logToStorage(entry: LogEntry): void {
    try {
      const storageKey = 'ieric_logs';
      const existingLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      existingLogs.push(entry);
      
      // Mantener solo los últimos 100 logs en storage
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Error guardando logs en storage:', error);
    }
  }

  // Métodos públicos para cada nivel
  debug(message: string, context?: string, data?: any): void {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: string, data?: any): void {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: any): void {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, data?: any): void {
    this.log('error', message, context, data);
  }

  // Obtener logs
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  // Obtener métricas
  getMetrics() {
    return { ...this.metrics };
  }

  // Limpiar logs
  clearLogs(): void {
    this.logs = [];
    this.metrics = {
      totalLogs: 0,
      logsByLevel: {
        debug: 0,
        info: 0,
        warn: 0,
        error: 0
      }
    };
    console.log('🧹 Logs limpiados');
  }

  // Obtener logs del storage
  getStoredLogs(): LogEntry[] {
    try {
      const storageKey = 'ieric_logs';
      const storedLogs = localStorage.getItem(storageKey);
      return storedLogs ? JSON.parse(storedLogs) : [];
    } catch (error) {
      console.error('Error obteniendo logs del storage:', error);
      return [];
    }
  }

  // Limpiar logs del storage
  clearStoredLogs(): void {
    try {
      localStorage.removeItem('ieric_logs');
      console.log('🧹 Logs del storage limpiados');
    } catch (error) {
      console.error('Error limpiando logs del storage:', error);
    }
  }

  // Exportar logs como JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Actualizar configuración
  updateConfig(newConfig: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Configuración de logging actualizada:', newConfig);
  }
}

// Configuración por defecto
const defaultConfig: LoggingConfig = {
  enabled: true,
  level: 'info',
  maxEntries: 1000,
  enableConsole: true,
  enableStorage: false,
  enableMetrics: true
};

// Instancia singleton del servicio
export const loggingService = new LoggingService(defaultConfig);
