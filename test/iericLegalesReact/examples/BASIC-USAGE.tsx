import React, { useState, useEffect } from 'react';
import { useSeleccionarFila } from '../src/hooks/useSeleccionarFila';
import { NotificationToast } from '../src/components/ui/NotificationToast';
import { ProgressTracker } from '../src/components/ui/ProgressTracker';
import type { Legajo } from '../src/utils/types';

// Ejemplo 1: Uso básico del hook
export const BasicUsageExample: React.FC = () => {
  const {
    legajoSeleccionado,
    isLoading,
    error,
    seleccionarFila,
    setLegajoSeleccionado
  } = useSeleccionarFila();

  const [legajos] = useState<Legajo[]>([
    { id: '1', numero: 'LEG-001', legajo: 'LEG-001' },
    { id: '2', numero: 'LEG-002', legajo: 'LEG-002' },
    { id: '3', numero: 'LEG-003', legajo: 'LEG-003' }
  ]);

  const handleSelectLegajo = async (legajo: Legajo) => {
    try {
      await seleccionarFila(legajo);
    } catch (error) {
      console.error('Error al seleccionar legajo:', error);
    }
  };

  const handleClearSelection = () => {
    setLegajoSeleccionado(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ejemplo Básico - useSeleccionarFila</h1>
      
      {/* Lista de legajos */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Seleccionar Legajo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {legajos.map((legajo) => (
            <button
              key={legajo.id}
              onClick={() => handleSelectLegajo(legajo)}
              disabled={isLoading}
              className="p-4 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="font-medium">{legajo.numero}</div>
              <div className="text-sm text-gray-500">ID: {legajo.id}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-blue-800">Cargando legajo...</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Legajo seleccionado */}
      {legajoSeleccionado && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-lg font-semibold text-green-800">
              Legajo Seleccionado: {legajoSeleccionado.numero}
            </h2>
            <button
              onClick={handleClearSelection}
              className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
              Limpiar
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Actas:</span>
              <span className="ml-2 text-gray-600">
                {legajoSeleccionado.actas?.length || 0}
              </span>
            </div>
            <div>
              <span className="font-medium">Artículos:</span>
              <span className="ml-2 text-gray-600">
                {legajoSeleccionado.articulos?.length || 0}
              </span>
            </div>
            <div>
              <span className="font-medium">Estados:</span>
              <span className="ml-2 text-gray-600">
                {legajoSeleccionado.historialEstados?.length || 0}
              </span>
            </div>
            <div>
              <span className="font-medium">Giros:</span>
              <span className="ml-2 text-gray-600">
                {legajoSeleccionado.historialGiros?.length || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Componentes de UI */}
      <NotificationToast />
      <ProgressTracker />
    </div>
  );
};

// Ejemplo 2: Con notificaciones personalizadas
export const NotificationsExample: React.FC = () => {
  const { seleccionarFila, notifications } = useSeleccionarFila();
  const [notificationsList, setNotificationsList] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = notifications.subscribe(setNotificationsList);
    return unsubscribe;
  }, [notifications]);

  const handleTestSuccess = () => {
    notifications.success('Éxito', 'Operación completada correctamente');
  };

  const handleTestError = () => {
    notifications.error('Error', 'Algo salió mal en la operación');
  };

  const handleTestWarning = () => {
    notifications.warning('Advertencia', 'Esta acción requiere confirmación');
  };

  const handleTestInfo = () => {
    notifications.info('Información', 'Datos actualizados correctamente');
  };

  const handleTestLoading = () => {
    const id = notifications.loading('Cargando', 'Procesando datos...');
    
    // Simular finalización después de 3 segundos
    setTimeout(() => {
      notifications.remove(id);
      notifications.success('Completado', 'Datos procesados exitosamente');
    }, 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ejemplo de Notificaciones</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Probar Notificaciones</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleTestSuccess}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Éxito
          </button>
          <button
            onClick={handleTestError}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Error
          </button>
          <button
            onClick={handleTestWarning}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Advertencia
          </button>
          <button
            onClick={handleTestInfo}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Información
          </button>
          <button
            onClick={handleTestLoading}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cargando
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Notificaciones Activas ({notificationsList.length})</h2>
        <div className="space-y-2">
          {notificationsList.map((notification) => (
            <div
              key={notification.id}
              className="p-3 border rounded-lg bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm text-gray-600">{notification.message}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {notification.type} • {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <NotificationToast />
    </div>
  );
};

// Ejemplo 3: Con seguimiento de progreso
export const ProgressExample: React.FC = () => {
  const { progress } = useSeleccionarFila();
  const [trackers, setTrackers] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = progress.subscribe((tracker) => {
      setTrackers(prev => {
        const existing = prev.find(t => t.id === tracker.id);
        if (existing) {
          return prev.map(t => t.id === tracker.id ? tracker : t);
        } else {
          return [...prev, tracker];
        }
      });
    });
    return unsubscribe;
  }, [progress]);

  const handleStartProgress = () => {
    const tracker = progress.createTracker(
      `progress-${Date.now()}`,
      'Procesando datos',
      ['Inicializando', 'Cargando datos', 'Procesando', 'Finalizando'],
      'Simulación de proceso largo'
    );

    progress.startTracker(tracker.id);

    // Simular progreso paso a paso
    setTimeout(() => {
      progress.updateStep(tracker.id, 'step_0', 100, 'completed');
      progress.updateStep(tracker.id, 'step_1', 0, 'running');
    }, 1000);

    setTimeout(() => {
      progress.updateStep(tracker.id, 'step_1', 100, 'completed');
      progress.updateStep(tracker.id, 'step_2', 0, 'running');
    }, 2000);

    setTimeout(() => {
      progress.updateStep(tracker.id, 'step_2', 100, 'completed');
      progress.updateStep(tracker.id, 'step_3', 0, 'running');
    }, 3000);

    setTimeout(() => {
      progress.updateStep(tracker.id, 'step_3', 100, 'completed');
      progress.completeTracker(tracker.id, true);
    }, 4000);
  };

  const handleStartFailingProgress = () => {
    const tracker = progress.createTracker(
      `failing-progress-${Date.now()}`,
      'Proceso con error',
      ['Paso 1', 'Paso 2', 'Paso 3'],
      'Simulación de proceso que falla'
    );

    progress.startTracker(tracker.id);

    // Simular progreso que falla
    setTimeout(() => {
      progress.updateStep(tracker.id, 'step_0', 100, 'completed');
      progress.updateStep(tracker.id, 'step_1', 0, 'running');
    }, 1000);

    setTimeout(() => {
      progress.updateStep(tracker.id, 'step_1', 0, 'failed', 'Error en el paso 2');
      progress.completeTracker(tracker.id, false);
    }, 2000);
  };

  const handleClearTrackers = () => {
    trackers.forEach(tracker => {
      progress.removeTracker(tracker.id);
    });
    setTrackers([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ejemplo de Progreso</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Probar Progreso</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleStartProgress}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Iniciar Progreso Exitoso
          </button>
          <button
            onClick={handleStartFailingProgress}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Iniciar Progreso con Error
          </button>
          <button
            onClick={handleClearTrackers}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Limpiar Trackers
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Trackers Activos ({trackers.length})</h2>
        <div className="space-y-4">
          {trackers.map((tracker) => (
            <div key={tracker.id} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium">{tracker.title}</h3>
                  {tracker.description && (
                    <p className="text-sm text-gray-600">{tracker.description}</p>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {tracker.status} • {tracker.overallProgress}%
                </div>
              </div>
              
              {/* Barra de progreso general */}
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      tracker.status === 'completed' ? 'bg-green-500' :
                      tracker.status === 'failed' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${tracker.overallProgress}%` }}
                  />
                </div>
              </div>
              
              {/* Pasos individuales */}
              <div className="space-y-2">
                {tracker.steps.map((step: any, index: number) => (
                  <div key={step.id} className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      step.status === 'completed' ? 'bg-green-500 text-white' :
                      step.status === 'failed' ? 'bg-red-500 text-white' :
                      step.status === 'running' ? 'bg-blue-500 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {step.status === 'completed' ? '✓' :
                       step.status === 'failed' ? '✗' :
                       step.status === 'running' ? '⟳' :
                       index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{step.name}</div>
                      {step.status === 'running' && (
                        <div className="text-xs text-gray-500">{step.progress}%</div>
                      )}
                      {step.error && (
                        <div className="text-xs text-red-600">{step.error}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProgressTracker />
    </div>
  );
};

// Ejemplo 4: Configuración avanzada
export const AdvancedConfigExample: React.FC = () => {
  const { retry, notifications, clearCache, getCacheStats } = useSeleccionarFila();
  const [cacheStats, setCacheStats] = useState<any>(null);

  const handleUpdateRetryConfig = () => {
    retry.updateConfig({
      maxAttempts: 5,
      baseDelay: 2000,
      maxDelay: 30000
    });
    notifications.success('Configuración actualizada', 'Retry configurado para 5 intentos');
  };

  const handleUpdateNotificationConfig = () => {
    notifications.updateConfig({
      defaultDuration: 10000,
      maxNotifications: 3
    });
    notifications.info('Configuración actualizada', 'Notificaciones configuradas');
  };

  const handleClearCache = () => {
    clearCache();
    notifications.info('Cache limpiado', 'Todos los datos en cache han sido eliminados');
    setCacheStats(getCacheStats());
  };

  const handleGetCacheStats = () => {
    const stats = getCacheStats();
    setCacheStats(stats);
    notifications.info('Estadísticas obtenidas', `Cache: ${stats.hits} hits, ${stats.misses} misses`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Configuración Avanzada</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuración de Retry */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Configuración de Retry</h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Máximo de intentos:</label>
              <input
                type="number"
                defaultValue="3"
                className="w-full p-2 border rounded"
                placeholder="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delay base (ms):</label>
              <input
                type="number"
                defaultValue="1000"
                className="w-full p-2 border rounded"
                placeholder="1000"
              />
            </div>
            <button
              onClick={handleUpdateRetryConfig}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Actualizar Configuración
            </button>
          </div>
        </div>

        {/* Configuración de Notificaciones */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Configuración de Notificaciones</h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Duración por defecto (ms):</label>
              <input
                type="number"
                defaultValue="5000"
                className="w-full p-2 border rounded"
                placeholder="5000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Máximo de notificaciones:</label>
              <input
                type="number"
                defaultValue="5"
                className="w-full p-2 border rounded"
                placeholder="5"
              />
            </div>
            <button
              onClick={handleUpdateNotificationConfig}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Actualizar Configuración
            </button>
          </div>
        </div>

        {/* Gestión de Cache */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Gestión de Cache</h2>
          <div className="space-y-2">
            <button
              onClick={handleGetCacheStats}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Obtener Estadísticas
            </button>
            <button
              onClick={handleClearCache}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Limpiar Cache
            </button>
          </div>
          
          {cacheStats && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">Estadísticas del Cache</h3>
              <div className="text-sm space-y-1">
                <div>Hits: {cacheStats.hits}</div>
                <div>Misses: {cacheStats.misses}</div>
                <div>Tamaño: {cacheStats.size}</div>
                <div>Hit Rate: {((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(1)}%</div>
              </div>
            </div>
          )}
        </div>

        {/* Información del Sistema */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Información del Sistema</h2>
          <div className="text-sm space-y-1">
            <div>Ambiente: {process.env.NODE_ENV}</div>
            <div>Versión: 1.0.0</div>
            <div>Última actualización: {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <NotificationToast />
    </div>
  );
};

// Componente principal que muestra todos los ejemplos
export const AllExamples: React.FC = () => {
  const [activeExample, setActiveExample] = useState('basic');

  const examples = [
    { id: 'basic', name: 'Uso Básico', component: BasicUsageExample },
    { id: 'notifications', name: 'Notificaciones', component: NotificationsExample },
    { id: 'progress', name: 'Progreso', component: ProgressExample },
    { id: 'advanced', name: 'Configuración Avanzada', component: AdvancedConfigExample }
  ];

  const ActiveComponent = examples.find(ex => ex.id === activeExample)?.component || BasicUsageExample;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8">
            {examples.map((example) => (
              <button
                key={example.id}
                onClick={() => setActiveExample(example.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeExample === example.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {example.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="py-8">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default AllExamples;
