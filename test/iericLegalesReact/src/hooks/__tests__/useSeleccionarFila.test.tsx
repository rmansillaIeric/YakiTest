import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSeleccionarFila } from '../useSeleccionarFila';
import { apiService, cacheService, notificationService, progressService, retryService } from '../../services';
import type { Legajo, LegajoExtendido } from '../../utils/types';

// Mock de los servicios
jest.mock('../../services', () => ({
  apiService: {
    getLegajoData: jest.fn()
  },
  cacheService: {
    has: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
    getStats: jest.fn()
  },
  notificationService: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    loading: jest.fn(),
    showRetryError: jest.fn(),
    showSuccessWithAction: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
    clear: jest.fn(),
    getNotifications: jest.fn(() => [])
  },
  progressService: {
    createTracker: jest.fn(),
    startTracker: jest.fn(),
    updateStep: jest.fn(),
    completeTracker: jest.fn(),
    cancelTracker: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
    getTracker: jest.fn(),
    getAllTrackers: jest.fn(() => []),
    getStats: jest.fn()
  },
  retryService: {
    executeRequest: jest.fn(),
    getConfig: jest.fn(() => ({ maxAttempts: 3 })),
    updateConfig: jest.fn()
  },
  configService: {
    getCacheDefaultTtl: jest.fn(() => 300000)
  },
  loggingService: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('useSeleccionarFila', () => {
  const mockLegajo: Legajo = {
    id: '1',
    numero: 'LEG-001',
    legajo: 'LEG-001',
    // ... otros campos requeridos
  };

  const mockLegajoData = {
    actas: [{ id: '1', nroActa: 'ACTA-001' }],
    articulos: [{ id: '1', descripcion: 'Artículo 1' }],
    historialEstados: [{ id: '1', estado: 'Pendiente' }],
    historialGiros: [{ id: '1', giro: 'Giro 1' }]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useSeleccionarFila());

      expect(result.current.legajoSeleccionado).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide all expected functions', () => {
      const { result } = renderHook(() => useSeleccionarFila());

      expect(typeof result.current.seleccionarFila).toBe('function');
      expect(typeof result.current.setLegajoSeleccionado).toBe('function');
      expect(typeof result.current.clearCache).toBe('function');
      expect(typeof result.current.getCacheStats).toBe('function');
      expect(typeof result.current.getLogs).toBe('function');
      expect(typeof result.current.clearLogs).toBe('function');
    });

    it('should provide UX services', () => {
      const { result } = renderHook(() => useSeleccionarFila());

      expect(result.current.notifications).toBeDefined();
      expect(result.current.progress).toBeDefined();
      expect(result.current.retry).toBeDefined();
    });
  });

  describe('seleccionarFila - Success Cases', () => {
    it('should select legajo successfully from cache', async () => {
      (cacheService.has as jest.Mock).mockReturnValue(true);
      (cacheService.get as jest.Mock).mockReturnValue(mockLegajoData);

      const { result } = renderHook(() => useSeleccionarFila());

      await act(async () => {
        await result.current.seleccionarFila(mockLegajo);
      });

      expect(cacheService.has).toHaveBeenCalledWith('legajo_1');
      expect(cacheService.get).toHaveBeenCalledWith('legajo_1');
      expect(notificationService.info).toHaveBeenCalledWith('Datos cargados', 'Datos obtenidos desde cache');
      expect(result.current.legajoSeleccionado).toBeDefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should select legajo successfully from API', async () => {
      (cacheService.has as jest.Mock).mockReturnValue(false);
      (retryService.executeRequest as jest.Mock).mockResolvedValue({
        success: true,
        data: mockLegajoData,
        attempts: 1,
        totalTime: 1000
      });

      const { result } = renderHook(() => useSeleccionarFila());

      await act(async () => {
        await result.current.seleccionarFila(mockLegajo);
      });

      expect(retryService.executeRequest).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalled();
      expect(result.current.legajoSeleccionado).toBeDefined();
    });

    it('should create progress tracker during API call', async () => {
      (cacheService.has as jest.Mock).mockReturnValue(false);
      (retryService.executeRequest as jest.Mock).mockResolvedValue({
        success: true,
        data: mockLegajoData,
        attempts: 1,
        totalTime: 1000
      });

      const { result } = renderHook(() => useSeleccionarFila());

      await act(async () => {
        await result.current.seleccionarFila(mockLegajo);
      });

      expect(progressService.createTracker).toHaveBeenCalledWith(
        expect.stringMatching(/^legajo_1_\d+$/),
        'Cargando datos del legajo',
        ['Obteniendo actas', 'Obteniendo artículos', 'Obteniendo historial de estados', 'Obteniendo historial de giros'],
        'Cargando información del legajo 1'
      );
      expect(progressService.startTracker).toHaveBeenCalled();
      expect(progressService.completeTracker).toHaveBeenCalledWith(expect.any(String), true);
    });

    it('should handle retry with notifications', async () => {
      (cacheService.has as jest.Mock).mockReturnValue(false);
      (retryService.executeRequest as jest.Mock).mockResolvedValue({
        success: true,
        data: mockLegajoData,
        attempts: 3,
        totalTime: 5000
      });

      const { result } = renderHook(() => useSeleccionarFila());

      await act(async () => {
        await result.current.seleccionarFila(mockLegajo);
      });

      expect(notificationService.success).toHaveBeenCalledWith(
        'Datos obtenidos',
        'Datos cargados después de 3 intentos'
      );
    });
  });

  describe('seleccionarFila - Error Cases', () => {
    it('should handle legajo without ID', async () => {
      const { result } = renderHook(() => useSeleccionarFila());

      await act(async () => {
        await result.current.seleccionarFila({ ...mockLegajo, id: '' });
      });

      expect(notificationService.warning).toHaveBeenCalledWith(
        'Selección inválida',
        'El elemento seleccionado no tiene un ID válido'
      );
      expect(result.current.legajoSeleccionado).toBeNull();
    });

    it('should handle API failure with retry', async () => {
      (cacheService.has as jest.Mock).mockReturnValue(false);
      (retryService.executeRequest as jest.Mock).mockResolvedValue({
        success: false,
        error: new Error('API Error'),
        attempts: 3,
        totalTime: 5000
      });

      const { result } = renderHook(() => useSeleccionarFila());

      await act(async () => {
        await result.current.seleccionarFila(mockLegajo);
      });

      expect(notificationService.showRetryError).toHaveBeenCalledWith(
        'Error al cargar legajo',
        expect.stringContaining('No se pudo cargar el legajo'),
        expect.any(Function)
      );
      expect(result.current.error).toBeDefined();
    });

    it('should handle AbortError gracefully', async () => {
      (cacheService.has as jest.Mock).mockReturnValue(false);
      const abortError = new Error('Request aborted');
      abortError.name = 'AbortError';
      (retryService.executeRequest as jest.Mock).mockRejectedValue(abortError);

      const { result } = renderHook(() => useSeleccionarFila());

      await act(async () => {
        await result.current.seleccionarFila(mockLegajo);
      });

      expect(notificationService.info).toHaveBeenCalledWith(
        'Operación cancelada',
        'La carga del legajo fue cancelada'
      );
      expect(progressService.cancelTracker).toHaveBeenCalled();
    });

    it('should cancel previous request when new one starts', async () => {
      (cacheService.has as jest.Mock).mockReturnValue(false);
      (retryService.executeRequest as jest.Mock).mockResolvedValue({
        success: true,
        data: mockLegajoData,
        attempts: 1,
        totalTime: 1000
      });

      const { result } = renderHook(() => useSeleccionarFila());

      // Start first request
      act(() => {
        result.current.seleccionarFila(mockLegajo);
      });

      // Start second request (should cancel first)
      await act(async () => {
        await result.current.seleccionarFila({ ...mockLegajo, id: '2' });
      });

      expect(notificationService.info).toHaveBeenCalledWith(
        'Cancelando...',
        'Cancelando carga anterior'
      );
    });
  });

  describe('setLegajoSeleccionado', () => {
    it('should update legajo seleccionado', () => {
      const { result } = renderHook(() => useSeleccionarFila());
      const mockLegajoExtendido: LegajoExtendido = {
        ...mockLegajo,
        actas: [],
        articulos: [],
        historialEstados: [],
        historialGiros: []
      };

      act(() => {
        result.current.setLegajoSeleccionado(mockLegajoExtendido);
      });

      expect(result.current.legajoSeleccionado).toBe(mockLegajoExtendido);
    });

    it('should clear legajo seleccionado when set to null', () => {
      const { result } = renderHook(() => useSeleccionarFila());

      act(() => {
        result.current.setLegajoSeleccionado(null);
      });

      expect(result.current.legajoSeleccionado).toBeNull();
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', () => {
      const { result } = renderHook(() => useSeleccionarFila());

      act(() => {
        result.current.clearCache();
      });

      expect(cacheService.clear).toHaveBeenCalled();
    });

    it('should get cache stats', () => {
      const mockStats = { hits: 5, misses: 2, size: 3 };
      (cacheService.getStats as jest.Mock).mockReturnValue(mockStats);

      const { result } = renderHook(() => useSeleccionarFila());

      const stats = result.current.getCacheStats();
      expect(stats).toBe(mockStats);
    });
  });

  describe('UX Services Integration', () => {
    it('should provide notification service methods', () => {
      const { result } = renderHook(() => useSeleccionarFila());

      expect(typeof result.current.notifications.subscribe).toBe('function');
      expect(typeof result.current.notifications.clear).toBe('function');
      expect(typeof result.current.notifications.success).toBe('function');
      expect(typeof result.current.notifications.error).toBe('function');
    });

    it('should provide progress service methods', () => {
      const { result } = renderHook(() => useSeleccionarFila());

      expect(typeof result.current.progress.subscribe).toBe('function');
      expect(typeof result.current.progress.getTracker).toBe('function');
      expect(typeof result.current.progress.createTracker).toBe('function');
    });

    it('should provide retry service methods', () => {
      const { result } = renderHook(() => useSeleccionarFila());

      expect(typeof result.current.retry.getConfig).toBe('function');
      expect(typeof result.current.retry.updateConfig).toBe('function');
      expect(typeof result.current.retry.execute).toBe('function');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup AbortController on unmount', () => {
      const { result, unmount } = renderHook(() => useSeleccionarFila());

      // Mock AbortController
      const mockAbort = jest.fn();
      const mockAbortController = { abort: mockAbort };
      
      // Simulate having an active request
      (result.current as any).abortControllerRef = { current: mockAbortController };

      unmount();

      expect(mockAbort).toHaveBeenCalled();
    });
  });

  describe('Memoization', () => {
    it('should memoize return value to prevent unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => useSeleccionarFila());

      const firstRender = result.current;
      rerender();
      const secondRender = result.current;

      expect(firstRender).toBe(secondRender);
    });

    it('should update return value when state changes', () => {
      const { result } = renderHook(() => useSeleccionarFila());

      const firstRender = result.current;

      act(() => {
        result.current.setLegajoSeleccionado(mockLegajo as LegajoExtendido);
      });

      const secondRender = result.current;

      expect(firstRender).not.toBe(secondRender);
      expect(secondRender.legajoSeleccionado).toBe(mockLegajo);
    });
  });
});
