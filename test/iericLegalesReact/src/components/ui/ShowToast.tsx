import { useEffect, type ReactNode } from 'react';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ShowToastProps {
  message: string | ReactNode;
  type?: ToastType;
  onClose: () => void;
}

const bgColors: Record<ToastType, string> = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

const icons: Record<ToastType, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
};

export default function ShowToast({ message, type = 'info', onClose }: ShowToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center gap-3 p-4 rounded-lg shadow-lg text-white ${bgColors[type]}`}>
        <span className="material-icons text-xl">{icons[type]}</span>
        <span className="font-medium">{message}</span>
        <button
          className="ml-auto text-white hover:text-gray-200"
          onClick={onClose}
          aria-label="Cerrar alerta"
        >
          <span className="material-icons text-sm">close</span>
        </button>
      </div>
    </div>
  );
}
