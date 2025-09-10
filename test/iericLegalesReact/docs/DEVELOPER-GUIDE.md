# 👨‍💻 Developer Guide - useSeleccionarFila

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura](#arquitectura)
3. [Configuración del Proyecto](#configuración-del-proyecto)
4. [Desarrollo Local](#desarrollo-local)
5. [Testing](#testing)
6. [Contribución](#contribución)
7. [Deployment](#deployment)
8. [Monitoreo](#monitoreo)

## 🚀 Introducción

Esta guía está dirigida a desarrolladores que quieren entender, modificar o contribuir al proyecto `useSeleccionarFila`. Aquí encontrarás información técnica detallada sobre la arquitectura, configuración y mejores prácticas.

## 🏗 Arquitectura

### Estructura del Proyecto

```
src/
├── hooks/
│   ├── useSeleccionarFila.tsx          # Hook principal
│   └── __tests__/
│       └── useSeleccionarFila.test.tsx # Tests del hook
├── services/
│   ├── api.service.ts                  # Servicio de API
│   ├── cache.service.ts                # Servicio de cache
│   ├── config.service.ts               # Servicio de configuración
│   ├── logging.service.ts              # Servicio de logging
│   ├── notification.service.ts         # Servicio de notificaciones
│   ├── retry.service.ts                # Servicio de retry
│   ├── progress.service.ts             # Servicio de progreso
│   ├── index.ts                        # Barrel exports
│   └── __tests__/                      # Tests de servicios
├── components/
│   └── ui/
│       ├── NotificationToast.tsx       # Componente de notificaciones
│       └── ProgressTracker.tsx         # Componente de progreso
├── utils/
│   └── types.tsx                       # Tipos TypeScript
├── docs/                               # Documentación
├── tests/                              # Tests de integración
└── setupTests.ts                       # Configuración de tests
```

### Patrones de Diseño

#### 1. Service Layer Pattern
Cada funcionalidad está encapsulada en un servicio especializado:

```typescript
// Ejemplo: NotificationService
class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Function[] = [];
  
  // Métodos públicos
  success(title: string, message: string): string { /* ... */ }
  error(title: string, message: string): string { /* ... */ }
  
  // Patrón Observer
  subscribe(listener: Function): () => void { /* ... */ }
}
```

#### 2. Hook Pattern
El hook principal orquesta los servicios:

```typescript
export const useSeleccionarFila = () => {
  // Estado local
  const [state, setState] = useState<LegajoState>(initialState);
  
  // Servicios
  const apiService = useMemo(() => new ApiService(), []);
  const cacheService = useMemo(() => new CacheService(), []);
  
  // Funciones principales
  const seleccionarFila = useCallback(async (item: Legajo) => {
    // Lógica de negocio
  }, []);
  
  // Retorno memoizado
  return useMemo(() => ({
    // API pública
  }), [dependencies]);
};
```

#### 3. Observer Pattern
Para notificaciones y progreso:

```typescript
class NotificationService {
  private listeners: Function[] = [];
  
  subscribe(listener: Function): () => void {
    this.listeners.push(listener);
    return () => this.removeListener(listener);
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.notifications));
  }
}
```

## ⚙️ Configuración del Proyecto

### 1. Dependencias

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^5.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "typescript": "^4.9.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  }
}
```

### 2. Scripts de Package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "lint": "eslint src --ext ts,tsx",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "type-check": "tsc --noEmit"
  }
}
```

### 3. Configuración de Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts']
  }
});
```

## 🛠 Desarrollo Local

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/iericLegalesReact.git
cd iericLegalesReact
```

### 2. Instalar Dependencias

```bash
npm install
# o
yarn install
```

### 3. Configurar Variables de Entorno

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_LOGGING=true
VITE_ENABLE_SOUND=true
VITE_ENABLE_VIBRATION=true
```

```bash
# .env.production
VITE_API_BASE_URL=https://api.ejemplo.com
VITE_ENABLE_LOGGING=false
VITE_ENABLE_SOUND=false
VITE_ENABLE_VIBRATION=false
```

### 4. Ejecutar en Desarrollo

```bash
npm run dev
# o
yarn dev
```

### 5. Ejecutar Tests

```bash
# Tests una vez
npm run test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage

# Tests para CI
npm run test:ci
```

## 🧪 Testing

### 1. Configuración de Jest

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### 2. Setup de Tests

```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';

// Mocks globales
global.fetch = jest.fn();
global.AbortController = jest.fn().mockImplementation(() => ({
  abort: jest.fn(),
  signal: { aborted: false }
}));

// Configuración adicional
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 3. Ejemplo de Test Unitario

```typescript
// src/services/__tests__/notification.service.test.ts
import { NotificationService } from '../notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  it('should create success notification', () => {
    const id = service.success('Test', 'Message');
    
    expect(id).toBeDefined();
    expect(service.getNotifications()).toHaveLength(1);
  });
});
```

### 4. Ejemplo de Test de Integración

```typescript
// src/hooks/__tests__/useSeleccionarFila.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useSeleccionarFila } from '../useSeleccionarFila';

describe('useSeleccionarFila', () => {
  it('should select legajo successfully', async () => {
    const { result } = renderHook(() => useSeleccionarFila());
    
    await act(async () => {
      await result.current.seleccionarFila(mockLegajo);
    });
    
    expect(result.current.legajoSeleccionado).toBeDefined();
  });
});
```

### 5. Tests de Rendimiento

```typescript
// tests/performance.test.ts
import { performance } from 'perf_hooks';

describe('Performance Tests', () => {
  it('should load legajo within acceptable time', async () => {
    const start = performance.now();
    
    // Ejecutar operación
    await seleccionarFila(mockLegajo);
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(1000); // Menos de 1 segundo
  });
});
```

## 🤝 Contribución

### 1. Flujo de Trabajo

```bash
# 1. Crear rama feature
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios
# ... código ...

# 3. Ejecutar tests
npm run test:ci

# 4. Ejecutar linting
npm run lint:fix

# 5. Commit
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 6. Push
git push origin feature/nueva-funcionalidad

# 7. Crear Pull Request
```

### 2. Estándares de Código

#### TypeScript
```typescript
// ✅ Bueno
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User> => {
  // implementación
};

// ❌ Evitar
const getUser = async (id: any): Promise<any> => {
  // implementación
};
```

#### Naming Conventions
```typescript
// ✅ Bueno
const notificationService = new NotificationService();
const isUserLoggedIn = true;
const MAX_RETRY_ATTEMPTS = 3;

// ❌ Evitar
const notificationSvc = new NotificationService();
const userLoggedIn = true;
const maxRetryAttempts = 3;
```

#### Error Handling
```typescript
// ✅ Bueno
try {
  const result = await apiService.getData();
  return result;
} catch (error) {
  if (error instanceof Error) {
    loggingService.error('API Error', error.message);
    throw new Error(`Failed to get data: ${error.message}`);
  }
  throw error;
}

// ❌ Evitar
try {
  const result = await apiService.getData();
  return result;
} catch (error) {
  console.log(error); // Sin logging estructurado
  throw error; // Sin contexto
}
```

### 3. Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Tipos de commit
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formato, espacios
refactor: refactoring
test: tests
chore: tareas de mantenimiento

# Ejemplos
git commit -m "feat: agregar retry automático"
git commit -m "fix: corregir error de cache"
git commit -m "docs: actualizar README"
```

### 4. Pull Request Template

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## Testing
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Tests manuales

## Checklist
- [ ] Código sigue estándares
- [ ] Tests pasan
- [ ] Documentación actualizada
- [ ] No breaking changes
```

## 🚀 Deployment

### 1. Build de Producción

```bash
# Build
npm run build

# Verificar build
npm run preview
```

### 2. Variables de Entorno

```bash
# .env.production
VITE_API_BASE_URL=https://api.produccion.com
VITE_ENABLE_LOGGING=false
VITE_ENABLE_SOUND=false
VITE_ENABLE_VIBRATION=false
VITE_CACHE_TTL=300000
VITE_MAX_RETRY_ATTEMPTS=3
```

### 3. Docker

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 4. CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run lint
      - run: npm run type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: dist/
```

## 📊 Monitoreo

### 1. Logging

```typescript
// Configuración de logging
const loggingConfig = {
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  enableConsole: true,
  enableRemote: process.env.NODE_ENV === 'production'
};

// Uso en servicios
loggingService.info('User action', 'SeleccionarFila', {
  legajoId: '123',
  timestamp: new Date().toISOString()
});
```

### 2. Métricas

```typescript
// Métricas de rendimiento
const metrics = {
  cacheHitRate: cacheService.getStats().hits / cacheService.getStats().total,
  averageResponseTime: calculateAverageResponseTime(),
  errorRate: calculateErrorRate(),
  retrySuccessRate: calculateRetrySuccessRate()
};
```

### 3. Health Checks

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      cache: cacheService.getStats(),
      api: apiService.getHealth(),
      notifications: notificationService.getStats()
    }
  };
  
  res.json(health);
});
```

### 4. Alertas

```typescript
// Configuración de alertas
const alertConfig = {
  errorRate: { threshold: 0.05, duration: '5m' },
  responseTime: { threshold: 2000, duration: '1m' },
  cacheHitRate: { threshold: 0.8, duration: '10m' }
};
```

## 🔧 Herramientas de Desarrollo

### 1. VS Code Extensions

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-jest"
  ]
}
```

### 2. Configuración de VS Code

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "jest.autoRun": "watch"
}
```

### 3. Scripts Útiles

```json
{
  "scripts": {
    "dev:debug": "vite --debug",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand",
    "analyze": "npm run build && npx vite-bundle-analyzer dist",
    "clean": "rm -rf dist node_modules/.cache",
    "fresh": "npm run clean && npm install && npm run dev"
  }
}
```

## 📚 Recursos Adicionales

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/)
- [Vite Documentation](https://vitejs.dev/)

---

**¿Necesitas ayuda?** Contacta al equipo de desarrollo o crea un issue en el repositorio.
