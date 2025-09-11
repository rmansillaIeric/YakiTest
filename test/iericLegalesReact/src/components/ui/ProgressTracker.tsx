import React, { useState, useEffect } from 'react';
import { progressService, type ProgressTracker, type ProgressStep } from '../../services';

// Estilos para el estado de los pasos
const getStepStatusStyles = (status: ProgressStep['status']) => {
  const baseStyles = "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium";
  
  const statusStyles = {
    pending: "bg-gray-200 text-gray-600",
    running: "bg-blue-500 text-white animate-pulse",
    completed: "bg-green-500 text-white",
    failed: "bg-red-500 text-white",
    skipped: "bg-yellow-500 text-white"
  };

  return `${baseStyles} ${statusStyles[status]}`;
};

// Iconos para cada estado
const getStepIcon = (status: ProgressStep['status']) => {
  const iconStyles = "w-4 h-4";
  
  const icons = {
    pending: <div className={`${iconStyles} bg-gray-400 rounded-full`} />,
    running: <svg className={`${iconStyles} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>,
    completed: <svg className={iconStyles} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>,
    failed: <svg className={iconStyles} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>,
    skipped: <svg className={iconStyles} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  };

  return icons[status];
};

// Componente individual de paso
const StepItem: React.FC<{ step: ProgressStep; index: number }> = ({ step, index }) => {
  const getDuration = () => {
    if (!step.startTime) return null;
    const endTime = step.endTime || new Date();
    const duration = endTime.getTime() - step.startTime.getTime();
    return Math.round(duration / 1000);
  };

  return (
    <div className="flex items-start space-x-3">
      <div className={getStepStatusStyles(step.status)}>
        {getStepIcon(step.status)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">{step.name}</p>
          <div className="flex items-center space-x-2">
            {step.status === 'running' && (
              <span className="text-xs text-blue-600 font-medium">
                {step.progress}%
              </span>
            )}
            {getDuration() !== null && (
              <span className="text-xs text-gray-500">
                {getDuration()}s
              </span>
            )}
          </div>
        </div>
        
        {/* Barra de progreso para pasos en ejecución */}
        {step.status === 'running' && (
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${step.progress}%` }}
            />
          </div>
        )}
        
        {/* Error message */}
        {step.error && (
          <p className="mt-1 text-xs text-red-600">{step.error}</p>
        )}
      </div>
    </div>
  );
};

// Componente individual de tracker
const TrackerItem: React.FC<{ tracker: ProgressTracker; onClose: (id: string) => void }> = ({ 
  tracker, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animación de entrada
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: ProgressTracker['status']) => {
    const colors = {
      idle: 'text-gray-500',
      running: 'text-blue-600',
      completed: 'text-green-600',
      failed: 'text-red-600',
      cancelled: 'text-yellow-600'
    };
    return colors[status];
  };

  const getStatusText = (status: ProgressTracker['status']) => {
    const texts = {
      idle: 'En espera',
      running: 'En progreso',
      completed: 'Completado',
      failed: 'Fallido',
      cancelled: 'Cancelado'
    };
    return texts[status];
  };

  const getDuration = () => {
    if (!tracker.startTime) return null;
    const endTime = tracker.endTime || new Date();
    const duration = endTime.getTime() - tracker.startTime.getTime();
    return Math.round(duration / 1000);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-lg border border-gray-200 p-4 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">{tracker.title}</h3>
          {tracker.description && (
            <p className="text-xs text-gray-600 mt-1">{tracker.description}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-medium ${getStatusColor(tracker.status)}`}>
            {getStatusText(tracker.status)}
          </span>
          {(tracker.status === 'completed' || tracker.status === 'failed' || tracker.status === 'cancelled') && (
            <button
              onClick={() => onClose(tracker.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Barra de progreso general */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progreso general</span>
          <span>{tracker.overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              tracker.status === 'completed' ? 'bg-green-500' :
              tracker.status === 'failed' ? 'bg-red-500' :
              tracker.status === 'cancelled' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${tracker.overallProgress}%` }}
          />
        </div>
      </div>

      {/* Pasos */}
      <div className="space-y-3">
        {tracker.steps.map((step, index) => (
          <StepItem key={step.id} step={step} index={index} />
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Paso {tracker.currentStep} de {tracker.totalSteps}</span>
          {getDuration() !== null && (
            <span>Tiempo: {getDuration()}s</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal del contenedor de progreso
export const ProgressTracker: React.FC = () => {
  const [trackers, setTrackers] = useState<ProgressTracker[]>([]);

  useEffect(() => {
    // Suscribirse a cambios en los trackers
    const unsubscribe = progressService.subscribe((tracker) => {
      setTrackers(prev => {
        const existing = prev.find(t => t.id === tracker.id);
        if (existing) {
          return prev.map(t => t.id === tracker.id ? tracker : t);
        } else {
          return [...prev, tracker];
        }
      });
    });
    
    // Obtener trackers existentes
    setTrackers(progressService.getAllTrackers());

    return unsubscribe;
  }, []);

  const handleClose = (id: string) => {
    progressService.removeTracker(id);
    setTrackers(prev => prev.filter(t => t.id !== id));
  };

  if (trackers.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm">
      {trackers.map((tracker) => (
        <TrackerItem
          key={tracker.id}
          tracker={tracker}
          onClose={handleClose}
        />
      ))}
    </div>
  );
};

export default ProgressTracker;
