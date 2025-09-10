import React, { useState, useEffect } from 'react';
import { notificationService, type Notification, type NotificationType } from '../../services';

// Estilos para cada tipo de notificación
const getNotificationStyles = (type: NotificationType) => {
  const baseStyles = "flex items-start p-4 rounded-lg shadow-lg border-l-4 max-w-sm w-full transform transition-all duration-300 ease-in-out";
  
  const typeStyles = {
    success: "bg-green-50 border-green-500 text-green-800",
    error: "bg-red-50 border-red-500 text-red-800",
    warning: "bg-yellow-50 border-yellow-500 text-yellow-800",
    info: "bg-blue-50 border-blue-500 text-blue-800",
    loading: "bg-gray-50 border-gray-500 text-gray-800"
  };

  return `${baseStyles} ${typeStyles[type]}`;
};

// Iconos para cada tipo
const getNotificationIcon = (type: NotificationType) => {
  const iconStyles = "flex-shrink-0 w-5 h-5 mr-3 mt-0.5";
  
  const icons = {
    success: <svg className={`${iconStyles} text-green-500`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>,
    error: <svg className={`${iconStyles} text-red-500`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>,
    warning: <svg className={`${iconStyles} text-yellow-500`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.725-1.36 3.49 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>,
    info: <svg className={`${iconStyles} text-blue-500`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>,
    loading: <svg className={`${iconStyles} text-gray-500 animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  };

  return icons[type];
};

// Componente individual de notificación
const NotificationItem: React.FC<{ notification: Notification; onClose: (id: string) => void }> = ({ 
  notification, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animación de entrada
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose(notification.id), 300);
  };

  const handleAction = (action: () => void) => {
    action();
    if (!notification.persistent) {
      handleClose();
    }
  };

  return (
    <div
      className={`${getNotificationStyles(notification.type)} ${
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex-1">
        <div className="flex items-start">
          {getNotificationIcon(notification.type)}
          <div className="flex-1">
            <h3 className="text-sm font-medium">{notification.title}</h3>
            <p className="mt-1 text-sm">{notification.message}</p>
            
            {/* Acciones */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-3 flex space-x-2">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleAction(action.action)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      action.variant === 'primary'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : action.variant === 'danger'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Botón de cerrar */}
      {!notification.persistent && (
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

// Componente principal del contenedor de notificaciones
export const NotificationToast: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Suscribirse a cambios en las notificaciones
    const unsubscribe = notificationService.subscribe(setNotifications);
    
    // Obtener notificaciones existentes
    setNotifications(notificationService.getNotifications());

    return unsubscribe;
  }, []);

  const handleClose = (id: string) => {
    notificationService.remove(id);
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={handleClose}
        />
      ))}
    </div>
  );
};

export default NotificationToast;
