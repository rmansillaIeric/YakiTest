import { performance } from 'perf_hooks';
import { NotificationService } from '../src/services/notification.service';
import { RetryService } from '../src/services/retry.service';
import { ProgressService } from '../src/services/progress.service';
import { CacheService } from '../src/services/cache.service';

describe('Performance Tests', () => {
  let notificationService: NotificationService;
  let retryService: RetryService;
  let progressService: ProgressService;
  let cacheService: CacheService;

  beforeEach(() => {
    notificationService = new NotificationService();
    retryService = new RetryService();
    progressService = new ProgressService();
    cacheService = new CacheService();
  });

  afterEach(() => {
    notificationService.clear();
    progressService.clearAll();
    cacheService.clear();
  });

  describe('NotificationService Performance', () => {
    it('should create notifications within acceptable time', () => {
      const iterations = 1000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        notificationService.success(`Test ${i}`, `Message ${i}`);
      }

      const end = performance.now();
      const duration = end - start;
      const averageTime = duration / iterations;

      expect(averageTime).toBeLessThan(1); // Menos de 1ms por notificación
      expect(duration).toBeLessThan(1000); // Menos de 1 segundo total
    });

    it('should handle subscription updates efficiently', () => {
      const iterations = 100;
      const subscribers = 10;
      const callbacks: jest.Mock[] = [];

      // Crear múltiples suscriptores
      for (let i = 0; i < subscribers; i++) {
        const callback = jest.fn();
        callbacks.push(callback);
        notificationService.subscribe(callback);
      }

      const start = performance.now();

      // Crear notificaciones que dispararán todas las callbacks
      for (let i = 0; i < iterations; i++) {
        notificationService.info(`Test ${i}`, `Message ${i}`);
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(500); // Menos de 500ms para 100 notificaciones con 10 suscriptores
      
      // Verificar que todas las callbacks fueron llamadas
      callbacks.forEach(callback => {
        expect(callback).toHaveBeenCalledTimes(iterations);
      });
    });

    it('should limit notifications to maxNotifications efficiently', () => {
      const maxNotifications = 5;
      const service = new NotificationService({ maxNotifications });
      const iterations = 1000;

      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        service.success(`Test ${i}`, `Message ${i}`);
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(100); // Debe ser muy rápido
      expect(service.getNotifications()).toHaveLength(maxNotifications);
    });
  });

  describe('RetryService Performance', () => {
    it('should execute successful operations quickly', async () => {
      const iterations = 100;
      const mockFn = jest.fn().mockResolvedValue('success');

      const start = performance.now();

      const promises = [];
      for (let i = 0; i < iterations; i++) {
        promises.push(retryService.execute(mockFn));
      }

      await Promise.all(promises);

      const end = performance.now();
      const duration = end - start;
      const averageTime = duration / iterations;

      expect(averageTime).toBeLessThan(10); // Menos de 10ms por operación
      expect(mockFn).toHaveBeenCalledTimes(iterations);
    });

    it('should handle retry delays efficiently', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('First attempt'))
        .mockResolvedValue('success');

      const start = performance.now();

      const result = await retryService.execute(mockFn);

      const end = performance.now();
      const duration = end - start;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(2000); // Debe completarse en menos de 2 segundos
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple concurrent retries efficiently', async () => {
      const concurrentOperations = 50;
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('First attempt'))
        .mockResolvedValue('success');

      const start = performance.now();

      const promises = [];
      for (let i = 0; i < concurrentOperations; i++) {
        promises.push(retryService.execute(mockFn));
      }

      const results = await Promise.all(promises);

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(5000); // Menos de 5 segundos para 50 operaciones concurrentes
      expect(results.every(result => result.success)).toBe(true);
      expect(mockFn).toHaveBeenCalledTimes(concurrentOperations * 2);
    });
  });

  describe('ProgressService Performance', () => {
    it('should create and update trackers efficiently', () => {
      const iterations = 100;
      const stepsPerTracker = 10;

      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        const tracker = progressService.createTracker(
          `tracker-${i}`,
          `Operation ${i}`,
          Array.from({ length: stepsPerTracker }, (_, j) => `Step ${j}`)
        );

        progressService.startTracker(tracker.id);

        // Actualizar todos los pasos
        for (let j = 0; j < stepsPerTracker; j++) {
          progressService.updateStep(tracker.id, `step_${j}`, 100, 'completed');
        }

        progressService.completeTracker(tracker.id, true);
      }

      const end = performance.now();
      const duration = end - start;
      const averageTime = duration / iterations;

      expect(averageTime).toBeLessThan(5); // Menos de 5ms por tracker
      expect(duration).toBeLessThan(1000); // Menos de 1 segundo total
    });

    it('should handle subscription updates efficiently', () => {
      const iterations = 100;
      const subscribers = 5;
      const callbacks: jest.Mock[] = [];

      // Crear suscriptores
      for (let i = 0; i < subscribers; i++) {
        const callback = jest.fn();
        callbacks.push(callback);
        progressService.subscribe(callback);
      }

      const start = performance.now();

      // Crear trackers que dispararán las callbacks
      for (let i = 0; i < iterations; i++) {
        const tracker = progressService.createTracker(
          `tracker-${i}`,
          `Operation ${i}`,
          ['Step 1', 'Step 2']
        );
        progressService.startTracker(tracker.id);
        progressService.completeTracker(tracker.id, true);
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(1000); // Menos de 1 segundo
      
      // Verificar que las callbacks fueron llamadas
      callbacks.forEach(callback => {
        expect(callback).toHaveBeenCalled();
      });
    });
  });

  describe('CacheService Performance', () => {
    it('should store and retrieve data efficiently', () => {
      const iterations = 1000;
      const dataSize = 1000; // 1KB por entrada
      const testData = 'x'.repeat(dataSize);

      const start = performance.now();

      // Almacenar datos
      for (let i = 0; i < iterations; i++) {
        cacheService.set(`key-${i}`, testData, 300000); // 5 minutos TTL
      }

      const storeEnd = performance.now();
      const storeDuration = storeEnd - start;

      // Recuperar datos
      const retrieveStart = performance.now();

      for (let i = 0; i < iterations; i++) {
        const data = cacheService.get(`key-${i}`);
        expect(data).toBe(testData);
      }

      const retrieveEnd = performance.now();
      const retrieveDuration = retrieveEnd - retrieveStart;

      expect(storeDuration).toBeLessThan(100); // Menos de 100ms para almacenar
      expect(retrieveDuration).toBeLessThan(50); // Menos de 50ms para recuperar
    });

    it('should handle cache eviction efficiently', () => {
      const maxSize = 100;
      const service = new CacheService({ maxSize });
      const iterations = 200; // Más que maxSize para probar evicción

      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        service.set(`key-${i}`, `data-${i}`, 300000);
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(50); // Debe ser muy rápido
      expect(service.getStats().size).toBe(maxSize);
    });

    it('should handle cache hits and misses efficiently', () => {
      const iterations = 1000;
      const hitRatio = 0.8; // 80% hits, 20% misses
      const hitCount = Math.floor(iterations * hitRatio);

      // Pre-llenar cache con algunos datos
      for (let i = 0; i < hitCount; i++) {
        cacheService.set(`hit-key-${i}`, `data-${i}`, 300000);
      }

      const start = performance.now();

      // Mezclar hits y misses
      for (let i = 0; i < iterations; i++) {
        if (i < hitCount) {
          cacheService.get(`hit-key-${i}`);
        } else {
          cacheService.get(`miss-key-${i}`);
        }
      }

      const end = performance.now();
      const duration = end - start;
      const averageTime = duration / iterations;

      expect(averageTime).toBeLessThan(0.1); // Menos de 0.1ms por operación
      expect(duration).toBeLessThan(100); // Menos de 100ms total
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory with notifications', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const iterations = 1000;

      // Crear y limpiar notificaciones
      for (let i = 0; i < iterations; i++) {
        notificationService.success(`Test ${i}`, `Message ${i}`);
        if (i % 100 === 0) {
          notificationService.clear();
        }
      }

      // Forzar garbage collection si está disponible
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // El aumento de memoria no debería ser significativo
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Menos de 10MB
    });

    it('should not leak memory with progress trackers', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const iterations = 100;

      // Crear y limpiar trackers
      for (let i = 0; i < iterations; i++) {
        const tracker = progressService.createTracker(
          `tracker-${i}`,
          `Operation ${i}`,
          ['Step 1', 'Step 2', 'Step 3']
        );
        progressService.startTracker(tracker.id);
        progressService.completeTracker(tracker.id, true);
        
        if (i % 10 === 0) {
          progressService.clearAll();
        }
      }

      // Forzar garbage collection si está disponible
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // Menos de 5MB
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent cache operations safely', async () => {
      const concurrentOperations = 100;
      const operations = [];

      const start = performance.now();

      // Operaciones concurrentes de escritura
      for (let i = 0; i < concurrentOperations; i++) {
        operations.push(
          Promise.resolve(cacheService.set(`concurrent-key-${i}`, `data-${i}`, 300000))
        );
      }

      // Operaciones concurrentes de lectura
      for (let i = 0; i < concurrentOperations; i++) {
        operations.push(
          Promise.resolve(cacheService.get(`concurrent-key-${i}`))
        );
      }

      await Promise.all(operations);

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(200); // Menos de 200ms para 200 operaciones concurrentes
    });

    it('should handle concurrent notification creation safely', async () => {
      const concurrentOperations = 50;
      const operations = [];

      const start = performance.now();

      for (let i = 0; i < concurrentOperations; i++) {
        operations.push(
          Promise.resolve(notificationService.success(`Concurrent ${i}`, `Message ${i}`))
        );
      }

      await Promise.all(operations);

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(100); // Menos de 100ms para 50 notificaciones concurrentes
      expect(notificationService.getNotifications().length).toBeLessThanOrEqual(5); // Limitado por maxNotifications
    });
  });

  describe('Stress Tests', () => {
    it('should handle high load of mixed operations', async () => {
      const iterations = 1000;
      const operations = [];

      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        // Mezclar diferentes tipos de operaciones
        if (i % 4 === 0) {
          operations.push(
            Promise.resolve(notificationService.info(`Info ${i}`, `Message ${i}`))
          );
        } else if (i % 4 === 1) {
          operations.push(
            Promise.resolve(cacheService.set(`stress-key-${i}`, `data-${i}`, 300000))
          );
        } else if (i % 4 === 2) {
          operations.push(
            Promise.resolve(cacheService.get(`stress-key-${i}`))
          );
        } else {
          const tracker = progressService.createTracker(
            `stress-tracker-${i}`,
            `Stress Operation ${i}`,
            ['Step 1']
          );
          operations.push(
            Promise.resolve(progressService.startTracker(tracker.id))
          );
        }
      }

      await Promise.all(operations);

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(2000); // Menos de 2 segundos para 1000 operaciones mixtas
    });
  });
});
