// Tipos para progreso
export type ProgressStep = {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number; // 0-100
  startTime?: Date;
  endTime?: Date;
  error?: string;
  metadata?: Record<string, any>;
};

export type ProgressTracker = {
  id: string;
  title: string;
  description?: string;
  totalSteps: number;
  currentStep: number;
  overallProgress: number; // 0-100
  status: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  steps: ProgressStep[];
  metadata?: Record<string, any>;
};

export type ProgressConfig = {
  updateInterval: number; // ms
  enableLogging: boolean;
  maxTrackers: number;
  autoCleanup: boolean;
  cleanupDelay: number; // ms
};

// Clase para manejar progreso
export class ProgressService {
  private trackers: Map<string, ProgressTracker> = new Map();
  private config: ProgressConfig;
  private listeners: ((tracker: ProgressTracker) => void)[] = [];
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: ProgressConfig = {
    updateInterval: 100,
    enableLogging: true,
    maxTrackers: 10,
    autoCleanup: true,
    cleanupDelay: 5 * 60 * 1000 // 5 minutos
  }) {
    this.config = config;
    
    if (this.config.autoCleanup) {
      this.startCleanup();
    }
  }

  // Iniciar limpieza automática
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupCompletedTrackers();
    }, this.config.cleanupDelay);
  }

  // Detener limpieza automática
  private stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Limpiar trackers completados
  private cleanupCompletedTrackers(): void {
    const now = Date.now();
    const completedTrackers: string[] = [];

    for (const [id, tracker] of this.trackers.entries()) {
      if (tracker.status === 'completed' || tracker.status === 'failed') {
        if (tracker.endTime && (now - tracker.endTime.getTime()) > this.config.cleanupDelay) {
          completedTrackers.push(id);
        }
      }
    }

    completedTrackers.forEach(id => {
      this.trackers.delete(id);
    });

    if (completedTrackers.length > 0 && this.config.enableLogging) {
      console.log(`🧹 Progress cleanup: ${completedTrackers.length} trackers eliminados`);
    }
  }

  // Notificar a los listeners
  private notifyListeners(tracker: ProgressTracker): void {
    this.listeners.forEach(listener => listener({ ...tracker }));
  }

  // Crear nuevo tracker
  createTracker(
    id: string,
    title: string,
    steps: string[],
    description?: string,
    metadata?: Record<string, any>
  ): ProgressTracker {
    // Limitar número de trackers
    if (this.trackers.size >= this.config.maxTrackers) {
      const oldestId = this.trackers.keys().next().value;
      this.trackers.delete(oldestId);
    }

    const progressSteps: ProgressStep[] = steps.map((stepName, index) => ({
      id: `step_${index}`,
      name: stepName,
      status: 'pending',
      progress: 0
    }));

    const tracker: ProgressTracker = {
      id,
      title,
      description,
      totalSteps: steps.length,
      currentStep: 0,
      overallProgress: 0,
      status: 'idle',
      steps: progressSteps,
      metadata
    };

    this.trackers.set(id, tracker);
    this.notifyListeners(tracker);

    if (this.config.enableLogging) {
      console.log(`📊 Progress tracker creado: ${title} (${steps.length} pasos)`);
    }

    return tracker;
  }

  // Iniciar tracker
  startTracker(id: string): boolean {
    const tracker = this.trackers.get(id);
    if (!tracker) return false;

    tracker.status = 'running';
    tracker.startTime = new Date();
    this.notifyListeners(tracker);

    if (this.config.enableLogging) {
      console.log(`▶️ Progress iniciado: ${tracker.title}`);
    }

    return true;
  }

  // Actualizar paso específico
  updateStep(
    trackerId: string,
    stepId: string,
    progress: number,
    status?: ProgressStep['status'],
    error?: string,
    metadata?: Record<string, any>
  ): boolean {
    const tracker = this.trackers.get(trackerId);
    if (!tracker) return false;

    const step = tracker.steps.find(s => s.id === stepId);
    if (!step) return false;

    step.progress = Math.max(0, Math.min(100, progress));
    if (status) step.status = status;
    if (error) step.error = error;
    if (metadata) step.metadata = { ...step.metadata, ...metadata };

    if (status === 'running' && !step.startTime) {
      step.startTime = new Date();
    }

    if (status === 'completed' || status === 'failed') {
      step.endTime = new Date();
    }

    // Actualizar progreso general
    this.updateOverallProgress(tracker);
    this.notifyListeners(tracker);

    return true;
  }

  // Actualizar progreso general
  private updateOverallProgress(tracker: ProgressTracker): void {
    const completedSteps = tracker.steps.filter(s => s.status === 'completed').length;
    const runningSteps = tracker.steps.filter(s => s.status === 'running');
    
    let totalProgress = 0;
    
    // Progreso de pasos completados
    totalProgress += completedSteps * 100;
    
    // Progreso de pasos en ejecución
    runningSteps.forEach(step => {
      totalProgress += step.progress;
    });
    
    tracker.overallProgress = Math.round(totalProgress / tracker.totalSteps);
    tracker.currentStep = completedSteps + runningSteps.length;
  }

  // Completar tracker
  completeTracker(id: string, success: boolean = true): boolean {
    const tracker = this.trackers.get(id);
    if (!tracker) return false;

    tracker.status = success ? 'completed' : 'failed';
    tracker.endTime = new Date();
    
    // Completar pasos pendientes si es exitoso
    if (success) {
      tracker.steps.forEach(step => {
        if (step.status === 'pending') {
          step.status = 'skipped';
          step.progress = 100;
        }
      });
    }

    this.updateOverallProgress(tracker);
    this.notifyListeners(tracker);

    if (this.config.enableLogging) {
      console.log(`✅ Progress ${success ? 'completado' : 'fallido'}: ${tracker.title} (${tracker.overallProgress}%)`);
    }

    return true;
  }

  // Cancelar tracker
  cancelTracker(id: string): boolean {
    const tracker = this.trackers.get(id);
    if (!tracker) return false;

    tracker.status = 'cancelled';
    tracker.endTime = new Date();
    
    // Marcar pasos en ejecución como cancelados
    tracker.steps.forEach(step => {
      if (step.status === 'running') {
        step.status = 'failed';
        step.error = 'Cancelado por el usuario';
      }
    });

    this.notifyListeners(tracker);

    if (this.config.enableLogging) {
      console.log(`❌ Progress cancelado: ${tracker.title}`);
    }

    return true;
  }

  // Obtener tracker
  getTracker(id: string): ProgressTracker | undefined {
    return this.trackers.get(id);
  }

  // Obtener todos los trackers
  getAllTrackers(): ProgressTracker[] {
    return Array.from(this.trackers.values());
  }

  // Suscribirse a cambios
  subscribe(listener: (tracker: ProgressTracker) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Limpiar tracker específico
  removeTracker(id: string): boolean {
    const deleted = this.trackers.delete(id);
    if (deleted && this.config.enableLogging) {
      console.log(`🗑️ Progress tracker eliminado: ${id}`);
    }
    return deleted;
  }

  // Limpiar todos los trackers
  clearAll(): void {
    this.trackers.clear();
    if (this.config.enableLogging) {
      console.log('🧹 Todos los progress trackers eliminados');
    }
  }

  // Actualizar configuración
  updateConfig(newConfig: Partial<ProgressConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.autoCleanup !== undefined) {
      if (newConfig.autoCleanup) {
        this.startCleanup();
      } else {
        this.stopCleanup();
      }
    }
  }

  // Obtener estadísticas
  getStats(): {
    totalTrackers: number;
    activeTrackers: number;
    completedTrackers: number;
    failedTrackers: number;
  } {
    const trackers = Array.from(this.trackers.values());
    
    return {
      totalTrackers: trackers.length,
      activeTrackers: trackers.filter(t => t.status === 'running').length,
      completedTrackers: trackers.filter(t => t.status === 'completed').length,
      failedTrackers: trackers.filter(t => t.status === 'failed').length
    };
  }

  // Destruir servicio
  destroy(): void {
    this.stopCleanup();
    this.trackers.clear();
    this.listeners = [];
  }
}

// Instancia singleton del servicio
export const progressService = new ProgressService();
