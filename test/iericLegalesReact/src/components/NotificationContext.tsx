import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type NotificationType = "info" | "success" | "warning" | "error";

type Notification = {
  message: string;
  type: NotificationType;
};

type NotificationContextProps = {
  notification: Notification | null;
  showNotification: (message: string, type?: NotificationType, duration?: number) => void;
};

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, type: NotificationType = "info", duration = 4000) => {
    setNotification({ message, type });

    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification }}>
      {children}
      {notification && (
        <div className={`toast ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification debe usarse dentro de un NotificationProvider");
  return context;
};
