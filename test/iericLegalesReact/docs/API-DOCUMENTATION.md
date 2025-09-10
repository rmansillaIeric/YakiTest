# 📚 API Documentation - useSeleccionarFila

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Instalación y Configuración](#instalación-y-configuración)
3. [API del Hook](#api-del-hook)
4. [Servicios](#servicios)
5. [Componentes UI](#componentes-ui)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Mejores Prácticas](#mejores-prácticas)
8. [Troubleshooting](#troubleshooting)

## 🚀 Introducción

`useSeleccionarFila` es un hook personalizado de React que proporciona funcionalidades avanzadas para la selección y carga de datos de legajos, incluyendo cache inteligente, retry automático, notificaciones toast y seguimiento de progreso.

### Características Principales

- ✅ **Cache inteligente** con TTL y evicción LRU
- ✅ **Retry automático** con backoff exponencial
- ✅ **Notificaciones toast** contextuales
- ✅ **Seguimiento de progreso** paso a paso
- ✅ **Cancelación de requests** con AbortController
- ✅ **Logging estructurado** para debugging
- ✅ **Configuración por ambiente** (desarrollo/producción)

## 🛠 Instalación y Configuración

### Dependencias Requeridas

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^5.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  }
}
```

### Configuración de TypeScript

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

## 🎯 API del Hook

### Importación

```typescript
import { useSeleccionarFila } from './hooks/useSeleccionarFila';
```

### Uso Básico

```typescript
function MiComponente() {
  const {
    legajoSeleccionado,
    isLoading,
    error,
    seleccionarFila,
    setLegajoSeleccionado
  } = useSeleccionarFila();

  return (
    <div>
      {isLoading && <p>Cargando...</p>}
      {error && <p>Error: {error}</p>}
      {legajoSeleccionado && (
        <div>
          <h2>{legajoSeleccionado.numero}</h2>
          {/* Renderizar datos del legajo */}
        </div>
      )}
    </div>
  );
}
```

### API Completa

```typescript
interface UseSeleccionarFilaReturn {
  // Estado principal
  legajoSeleccionado: LegajoExtendido | null;
  isLoading: boolean;
  error: string | null;
  
  // Funciones principales
  seleccionarFila: (item: Legajo) => Promise<void>;
  setLegajoSeleccionado: (legajo: LegajoExtendido | null) => void;
  
  // Funciones de cache
  clearCache: () => void;
  getCacheStats: () => CacheStats;
  
  // Funciones de logging
  getLogs: () => LogEntry[];
  clearLogs: () => void;
  
  // Servicios de UX
  notifications: NotificationServiceAPI;
  progress: ProgressServiceAPI;
  retry: RetryServiceAPI;
}
```

## 🔧 Servicios

### 1. NotificationService

Servicio para manejar notificaciones toast.

```typescript
interface NotificationServiceAPI {
  // Suscripción
  subscribe: (listener: (notifications: Notification[]) => void) => () => void;
  
  // Gestión
  clear: () => void;
  getNotifications: () => Notification[];
  
  // Creación de notificaciones
  success: (title: string, message: string, options?: NotificationOptions) => string;
  error: (title: string, message: string, options?: NotificationOptions) => string;
  warning: (title: string, message: string, options?: NotificationOptions) => string;
  info: (title: string, message: string, options?: NotificationOptions) => string;
  loading: (title: string, message: string, options?: NotificationOptions) => string;
}
```

#### Ejemplo de Uso

```typescript
const { notifications } = useSeleccionarFila();

// Crear notificación
notifications.success('Éxito', 'Operación completada');

// Suscribirse a cambios
useEffect(() => {
  const unsubscribe = notifications.subscribe((notifications) => {
    console.log('Notificaciones:', notifications);
  });
  return unsubscribe;
}, []);
```

### 2. ProgressService

Servicio para seguimiento de progreso paso a paso.

```typescript
interface ProgressServiceAPI {
  // Suscripción
  subscribe: (listener: (tracker: ProgressTracker) => void) => () => void;
  
  // Gestión de trackers
  getTracker: (id: string) => ProgressTracker | undefined;
  getAllTrackers: () => ProgressTracker[];
  getStats: () => ProgressStats;
  
  // Operaciones
  createTracker: (id: string, title: string, steps: string[], description?: string) => ProgressTracker;
  updateStep: (trackerId: string, stepId: string, progress: number, status?: StepStatus) => boolean;
  completeTracker: (id: string, success: boolean) => boolean;
  cancelTracker: (id: string) => boolean;
}
```

#### Ejemplo de Uso

```typescript
const { progress } = useSeleccionarFila();

// Crear tracker
const tracker = progress.createTracker(
  'operacion-1',
  'Cargando datos',
  ['Paso 1', 'Paso 2', 'Paso 3']
);

// Iniciar progreso
progress.startTracker('operacion-1');

// Actualizar pasos
progress.updateStep('operacion-1', 'step_0', 50, 'running');
progress.updateStep('operacion-1', 'step_0', 100, 'completed');
```

### 3. RetryService

Servicio para retry automático con backoff exponencial.

```typescript
interface RetryServiceAPI {
  // Configuración
  getConfig: () => RetryConfig;
  updateConfig: (config: Partial<RetryConfig>) => void;
  
  // Ejecución
  execute: <T>(fn: () => Promise<T>, options?: RetryOptions) => Promise<RetryResult<T>>;
  executeRequest: <T>(fn: () => Promise<T>, options?: RetryOptions) => Promise<RetryResult<T>>;
  executeCritical: <T>(fn: () => Promise<T>, options?: RetryOptions) => Promise<RetryResult<T>>;
  executeFast: <T>(fn: () => Promise<T>, options?: RetryOptions) => Promise<RetryResult<T>>;
}
```

#### Ejemplo de Uso

```typescript
const { retry } = useSeleccionarFila();

// Configurar retry
retry.updateConfig({
  maxAttempts: 5,
  baseDelay: 2000
});

// Ejecutar con retry
const result = await retry.executeRequest(
  () => fetch('/api/data'),
  {
    onRetry: (attempt, error) => console.log(`Intento ${attempt}`),
    onSuccess: (data, attempts) => console.log('Éxito'),
    onFailure: (error, attempts) => console.log('Falló')
  }
);
```

## 🎨 Componentes UI

### NotificationToast

Componente para mostrar notificaciones toast.

```typescript
import { NotificationToast } from './components/ui/NotificationToast';

function App() {
  return (
    <div>
      {/* Tu aplicación */}
      <NotificationToast />
    </div>
  );
}
```

### ProgressTracker

Componente para mostrar indicadores de progreso.

```typescript
import { ProgressTracker } from './components/ui/ProgressTracker';

function App() {
  return (
    <div>
      {/* Tu aplicación */}
      <ProgressTracker />
    </div>
  );
}
```

## 📖 Ejemplos de Uso

### Ejemplo 1: Uso Básico

```typescript
import React from 'react';
import { useSeleccionarFila } from './hooks/useSeleccionarFila';

function LegajoList() {
  const { legajoSeleccionado, isLoading, error, seleccionarFila } = useSeleccionarFila();

  const handleSelectLegajo = async (legajo) => {
    await seleccionarFila(legajo);
  };

  return (
    <div>
      {isLoading && <p>Cargando legajo...</p>}
      {error && <p>Error: {error}</p>}
      {legajoSeleccionado && (
        <div>
          <h2>Legajo: {legajoSeleccionado.numero}</h2>
          <p>Actas: {legajoSeleccionado.actas?.length || 0}</p>
          <p>Artículos: {legajoSeleccionado.articulos?.length || 0}</p>
        </div>
      )}
    </div>
  );
}
```

### Ejemplo 2: Con Notificaciones

```typescript
import React, { useEffect } from 'react';
import { useSeleccionarFila } from './hooks/useSeleccionarFila';

function LegajoList() {
  const { seleccionarFila, notifications } = useSeleccionarFila();

  useEffect(() => {
    const unsubscribe = notifications.subscribe((notifications) => {
      notifications.forEach(notification => {
        if (notification.type === 'error') {
          console.error('Error:', notification.message);
        }
      });
    });
    return unsubscribe;
  }, []);

  const handleSelectLegajo = async (legajo) => {
    try {
      await seleccionarFila(legajo);
      notifications.success('Éxito', 'Legajo cargado correctamente');
    } catch (error) {
      notifications.error('Error', 'No se pudo cargar el legajo');
    }
  };

  return (
    <div>
      {/* Tu UI */}
    </div>
  );
}
```

### Ejemplo 3: Con Progreso

```typescript
import React, { useEffect, useState } from 'react';
import { useSeleccionarFila } from './hooks/useSeleccionarFila';

function LegajoList() {
  const { seleccionarFila, progress } = useSeleccionarFila();
  const [currentProgress, setCurrentProgress] = useState(null);

  useEffect(() => {
    const unsubscribe = progress.subscribe((tracker) => {
      setCurrentProgress(tracker);
    });
    return unsubscribe;
  }, []);

  const handleSelectLegajo = async (legajo) => {
    await seleccionarFila(legajo);
  };

  return (
    <div>
      {currentProgress && (
        <div>
          <h3>{currentProgress.title}</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${currentProgress.overallProgress}%` }}
            />
          </div>
          <p>{currentProgress.overallProgress}% completado</p>
        </div>
      )}
      {/* Tu UI */}
    </div>
  );
}
```

### Ejemplo 4: Configuración Avanzada

```typescript
import React, { useEffect } from 'react';
import { useSeleccionarFila } from './hooks/useSeleccionarFila';

function LegajoList() {
  const { retry, notifications } = useSeleccionarFila();

  useEffect(() => {
    // Configurar retry para operaciones críticas
    retry.updateConfig({
      maxAttempts: 5,
      baseDelay: 2000,
      maxDelay: 30000
    });

    // Configurar notificaciones
    notifications.updateConfig({
      defaultDuration: 5000,
      maxNotifications: 3
    });
  }, []);

  return (
    <div>
      {/* Tu UI */}
    </div>
  );
}
```

## 🏆 Mejores Prácticas

### 1. Manejo de Errores

```typescript
// ✅ Bueno
const handleSelectLegajo = async (legajo) => {
  try {
    await seleccionarFila(legajo);
  } catch (error) {
    // El hook ya maneja la mayoría de errores
    console.error('Error inesperado:', error);
  }
};

// ❌ Evitar
const handleSelectLegajo = async (legajo) => {
  await seleccionarFila(legajo); // Sin manejo de errores
};
```

### 2. Limpieza de Suscripciones

```typescript
// ✅ Bueno
useEffect(() => {
  const unsubscribe = notifications.subscribe(handleNotifications);
  return unsubscribe; // Limpiar suscripción
}, []);

// ❌ Evitar
useEffect(() => {
  notifications.subscribe(handleNotifications); // Sin limpieza
}, []);
```

### 3. Uso de Cache

```typescript
// ✅ Bueno - El hook maneja el cache automáticamente
const { seleccionarFila } = useSeleccionarFila();

// ❌ Evitar - No acceder directamente al cache
const { cacheService } = useSeleccionarFila();
cacheService.get('legajo_1'); // Usar el hook en su lugar
```

### 4. Configuración por Ambiente

```typescript
// ✅ Bueno
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    retry.updateConfig({ maxAttempts: 5 });
    notifications.updateConfig({ enableSound: true });
  } else {
    retry.updateConfig({ maxAttempts: 3 });
    notifications.updateConfig({ enableSound: false });
  }
}, []);
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. "Cannot find module 'react'"

**Solución**: Instalar las dependencias de React
```bash
npm install react react-dom @types/react @types/react-dom
```

#### 2. Notificaciones no se muestran

**Solución**: Asegúrate de incluir el componente NotificationToast
```typescript
import { NotificationToast } from './components/ui/NotificationToast';

function App() {
  return (
    <div>
      <NotificationToast />
      {/* Tu aplicación */}
    </div>
  );
}
```

#### 3. Progreso no se actualiza

**Solución**: Verifica que estés suscrito a los cambios
```typescript
useEffect(() => {
  const unsubscribe = progress.subscribe((tracker) => {
    console.log('Progreso:', tracker.overallProgress);
  });
  return unsubscribe;
}, []);
```

#### 4. Cache no funciona

**Solución**: Verifica la configuración del cache
```typescript
const { getCacheStats } = useSeleccionarFila();
console.log('Cache stats:', getCacheStats());
```

### Debugging

#### 1. Habilitar Logging

```typescript
// En desarrollo
if (process.env.NODE_ENV === 'development') {
  const { getLogs } = useSeleccionarFila();
  console.log('Logs:', getLogs());
}
```

#### 2. Verificar Estado

```typescript
const { legajoSeleccionado, isLoading, error } = useSeleccionarFila();
console.log('Estado:', { legajoSeleccionado, isLoading, error });
```

#### 3. Monitorear Progreso

```typescript
useEffect(() => {
  const unsubscribe = progress.subscribe((tracker) => {
    console.log('Tracker:', tracker);
  });
  return unsubscribe;
}, []);
```

## 📞 Soporte

Para más información o soporte:

- 📧 Email: soporte@ejemplo.com
- 📚 Documentación: [Enlace a docs]
- 🐛 Issues: [Enlace a GitHub Issues]
- 💬 Chat: [Enlace a Discord/Slack]

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024
