// Tipos para notificaciones
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  timestamp: Date;
};

export type NotificationAction = {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
};

export type NotificationConfig = {
  defaultDuration: number;
  maxNotifications: number;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  enableSound: boolean;
  enableVibration: boolean;
};

// Clase para manejar notificaciones
export class NotificationService {
  private notifications: Notification[] = [];
  private config: NotificationConfig;
  private listeners: ((notifications: Notification[]) => void)[] = [];

  constructor(config: NotificationConfig = {
    defaultDuration: 5000,
    maxNotifications: 5,
    position: 'top-right',
    enableSound: false,
    enableVibration: false
  }) {
    this.config = config;
  }

  // Generar ID único para notificaciones
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Notificar a los listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Crear notificación
  private createNotification(
    type: NotificationType,
    title: string,
    message: string,
    options: {
      duration?: number;
      persistent?: boolean;
      actions?: NotificationAction[];
    } = {}
  ): Notification {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      duration: options.duration ?? this.config.defaultDuration,
      persistent: options.persistent ?? false,
      actions: options.actions,
      timestamp: new Date()
    };

    return notification;
  }

  // Agregar notificación
  private addNotification(notification: Notification): void {
    // Limitar número de notificaciones
    if (this.notifications.length >= this.config.maxNotifications) {
      this.notifications.shift();
    }

    this.notifications.push(notification);
    this.notifyListeners();

    // Auto-remover si no es persistente
    if (!notification.persistent && notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, notification.duration);
    }

    // Efectos adicionales
    if (this.config.enableSound) {
      this.playSound(notification.type);
    }

    if (this.config.enableVibration && 'vibrate' in navigator) {
      this.vibrate(notification.type);
    }
  }

  // Reproducir sonido según el tipo
  private playSound(type: NotificationType): void {
    const sounds = {
      success: '🔔',
      error: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
      loading: '⏳'
    };

    // En un entorno real, aquí reproducirías sonidos reales
    console.log(`Sound: ${sounds[type]}`);
  }

  // Vibrar según el tipo
  private vibrate(type: NotificationType): void {
    const patterns = {
      success: [100],
      error: [200, 100, 200],
      warning: [300],
      info: [50],
      loading: [100, 50, 100]
    };

    navigator.vibrate(patterns[type]);
  }

  // Métodos públicos para cada tipo de notificación
  success(title: string, message: string, options?: { duration?: number; actions?: NotificationAction[] }): string {
    const notification = this.createNotification('success', title, message, options);
    this.addNotification(notification);
    return notification.id;
  }

  error(title: string, message: string, options?: { duration?: number; persistent?: boolean; actions?: NotificationAction[] }): string {
    const notification = this.createNotification('error', title, message, {
      ...options,
      persistent: options?.persistent ?? true // Errores son persistentes por defecto
    });
    this.addNotification(notification);
    return notification.id;
  }

  warning(title: string, message: string, options?: { duration?: number; actions?: NotificationAction[] }): string {
    const notification = this.createNotification('warning', title, message, options);
    this.addNotification(notification);
    return notification.id;
  }

  info(title: string, message: string, options?: { duration?: number; actions?: NotificationAction[] }): string {
    const notification = this.createNotification('info', title, message, options);
    this.addNotification(notification);
    return notification.id;
  }

  loading(title: string, message: string, options?: { persistent?: boolean }): string {
    const notification = this.createNotification('loading', title, message, {
      ...options,
      persistent: options?.persistent ?? true // Loading es persistente por defecto
    });
    this.addNotification(notification);
    return notification.id;
  }

  // Remover notificación
  remove(id: string): void {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.notifyListeners();
    }
  }

  // Remover todas las notificaciones
  clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  // Obtener notificaciones
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Suscribirse a cambios
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    
    // Retornar función de desuscripción
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Actualizar configuración
  updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Obtener configuración
  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  // Métodos de conveniencia para casos comunes
  showRetryError(title: string, message: string, onRetry: () => void): string {
    return this.error(title, message, {
      actions: [
        {
          label: 'Reintentar',
          action: onRetry,
          variant: 'primary'
        },
        {
          label: 'Cancelar',
          action: () => this.clear(),
          variant: 'secondary'
        }
      ]
    });
  }

  showSuccessWithAction(title: string, message: string, actionLabel: string, onAction: () => void): string {
    return this.success(title, message, {
      actions: [
        {
          label: actionLabel,
          action: onAction,
          variant: 'primary'
        }
      ]
    });
  }

  showProgress(title: string, message: string, progress: number): string {
    const notification = this.createNotification('loading', title, `${message} (${progress}%)`, {
      persistent: true
    });
    this.addNotification(notification);
    return notification.id;
  }

  updateProgress(id: string, progress: number, message?: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.message = message ? `${message} (${progress}%)` : `${notification.message.split('(')[0]}(${progress}%)`;
      this.notifyListeners();
    }
  }
}

// Instancia singleton del servicio
export const notificationService = new NotificationService();
