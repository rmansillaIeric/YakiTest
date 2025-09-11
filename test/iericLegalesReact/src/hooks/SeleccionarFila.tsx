import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { Legajo, LegajoExtendido } from '../utils/types';
import { 
  apiService, 
  cacheService, 
  configService, 
  loggingService,
  notificationService,
  retryService,
  progressService
} from '../services';

type LegajoState = {
  legajoSeleccionado: LegajoExtendido | null;
  isLoading: boolean;
  error: string | null;
};

export const useSeleccionarFila = () => {
    const [state, setState] = useState<LegajoState>({
        legajoSeleccionado: null,
        isLoading: false,
        error: null
    });

    // Ref para AbortController
    const abortControllerRef = useRef<AbortController | null>(null);

    // Función helper para obtener datos con cache, retry y notificaciones
    const fetchDataWithCache = useCallback(async (legajoId: string) => {
        const cacheKey = `legajo_${legajoId}`;
        
        // Verificar cache primero
        if (cacheService.has(cacheKey)) {
            loggingService.info('Cache hit', 'SeleccionarFila', { legajoId, cacheKey });
            notificationService.info('Datos cargados', 'Datos obtenidos desde cache');
            return cacheService.get(cacheKey);
        }

        // Crear tracker de progreso
        const progressId = `legajo_${legajoId}_${Date.now()}`;
        const tracker = progressService.createTracker(
            progressId,
            'Cargando datos del legajo',
            ['Obteniendo actas', 'Obteniendo artículos', 'Obteniendo historial de estados', 'Obteniendo historial de giros'],
            `Cargando información del legajo ${legajoId}`
        );

        try {
            progressService.startTracker(progressId);
            loggingService.info('Obteniendo datos del legajo', 'SeleccionarFila', { legajoId });
            
            // Usar servicio de retry para obtener datos
            const result = await retryService.executeRequest(
                () => apiService.getLegajoData(legajoId),
                {
                    onRetry: (attempt, error) => {
                        notificationService.warning(
                            'Reintentando...', 
                            `Intento ${attempt} de ${retryService.getConfig().maxAttempts}`
                        );
                        loggingService.warn(`Retry ${attempt}`, 'SeleccionarFila', { legajoId, error: error.message });
                    },
                    onSuccess: (data, attempts) => {
                        if (attempts > 1) {
                            notificationService.success('Datos obtenidos', `Datos cargados después de ${attempts} intentos`);
                        }
                    },
                    onFailure: (error, attempts) => {
                        notificationService.error('Error de carga', `No se pudieron cargar los datos después de ${attempts} intentos`);
                    }
                }
            );

            if (!result.success) {
                throw result.error;
            }

            const data = result.data;
            
            if (!data) {
                throw new Error('No se obtuvieron datos del servidor');
            }
            
            // Actualizar progreso paso a paso
            progressService.updateStep(progressId, 'step_0', 100, 'completed');
            progressService.updateStep(progressId, 'step_1', 100, 'completed');
            progressService.updateStep(progressId, 'step_2', 100, 'completed');
            progressService.updateStep(progressId, 'step_3', 100, 'completed');
            
            // Guardar en cache
            const ttl = configService.getCacheDefaultTtl();
            cacheService.set(cacheKey, data, ttl);
            
            // Completar tracker
            progressService.completeTracker(progressId, true);
            
            loggingService.info('Datos obtenidos y guardados en cache', 'SeleccionarFila', { 
                legajoId, 
                cacheKey,
                actas: data.actas.length,
                articulos: data.articulos.length,
                historialEstados: data.historialEstados.length,
                historialGiros: data.historialGiros.length,
                attempts: result.attempts,
                totalTime: result.totalTime
            });
            
            notificationService.success('Datos cargados', `Información del legajo cargada exitosamente`);
            
            return data;
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                loggingService.warn('Request cancelado', 'SeleccionarFila', { legajoId });
                progressService.cancelTracker(progressId);
                throw error;
            }
            
            // Marcar tracker como fallido
            progressService.completeTracker(progressId, false);
            
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            
            loggingService.error('Error obteniendo datos del legajo', 'SeleccionarFila', { 
                legajoId, 
                error: errorMessage
            });

            // Mostrar notificación de error con opción de retry
            notificationService.showRetryError(
                'Error de carga',
                `No se pudieron cargar los datos del legajo: ${errorMessage}`,
                () => {
                    // Retry manual
                    fetchDataWithCache(legajoId);
                }
            );
            
            throw error;
        }
    }, []);

    // Función helper para validar y formatear arrays (memoizada)
    const validateArray = useCallback(<T,>(data: unknown, fallback: T[] = []): T[] => {
        return Array.isArray(data) ? data : fallback;
    }, []);

    const seleccionarFila = useCallback(async (item: Legajo) => {
        if (!item.id) {
            loggingService.warn('Intento de seleccionar fila sin ID', 'SeleccionarFila', { item });
            notificationService.warning('Selección inválida', 'El elemento seleccionado no tiene un ID válido');
            return;
        }

        // Cancelar request anterior si existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            notificationService.info('Cancelando...', 'Cancelando carga anterior');
        }

        // Crear nuevo AbortController
        abortControllerRef.current = new AbortController();

        try {
            setState((prev: LegajoState) => ({ ...prev, isLoading: true, error: null }));

            // Mostrar notificación de inicio
            notificationService.loading(
                'Cargando legajo',
                `Obteniendo información del legajo ${item.numero || item.id}`
            );

            loggingService.info('Iniciando selección de fila', 'SeleccionarFila', { 
                legajoId: item.id,
                legajoNumero: item.numero
            });

            // Usar servicio para obtener datos
            const data = await fetchDataWithCache(item.id);

            // Crear el objeto legajo extendido con todos los datos
            const legajoExtendido: LegajoExtendido = {
                ...item,
                nroActa: data.actas[0]?.nroActa ?? null,
                articulo: data.articulos[0] ?? null,
                actas: data.actas,
                legajoArticulos: data.articulos,
                historialEstados: data.historialEstados,
                historialGiros: data.historialGiros,
            };

            setState({
                legajoSeleccionado: legajoExtendido,
                isLoading: false,
                error: null
            });

            // Mostrar notificación de éxito con estadísticas
            const stats = {
                actas: data.actas.length,
                articulos: data.articulos.length,
                historialEstados: data.historialEstados.length,
                historialGiros: data.historialGiros.length
            };

            notificationService.showSuccessWithAction(
                'Legajo cargado',
                `Legajo ${item.numero || item.id} cargado exitosamente. Actas: ${stats.actas}, Artículos: ${stats.articulos}`,
                'Ver detalles',
                () => {
                    // Acción opcional para ver detalles
                    console.log('Ver detalles del legajo:', legajoExtendido);
                }
            );

            loggingService.info('Fila seleccionada exitosamente', 'SeleccionarFila', {
                legajoId: item.id,
                legajoNumero: item.numero,
                ...stats
            });

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                loggingService.info('Selección de fila cancelada', 'SeleccionarFila', { legajoId: item.id });
                notificationService.info('Operación cancelada', 'La carga del legajo fue cancelada');
                return;
            }

            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar datos del legajo';
            
            setState({
                legajoSeleccionado: item, // Fallback al item original
                isLoading: false,
                error: errorMessage
            });

            // Mostrar notificación de error con opción de retry
            notificationService.showRetryError(
                'Error al cargar legajo',
                `No se pudo cargar el legajo ${item.numero || item.id}: ${errorMessage}`,
                () => {
                    // Retry manual
                    seleccionarFila(item);
                }
            );

            loggingService.error('Error al seleccionar fila', 'SeleccionarFila', {
                legajoId: item.id,
                legajoNumero: item.numero,
                error: errorMessage
            });
        }
    }, [fetchDataWithCache]);

    const setLegajoSeleccionado = useCallback((legajo: LegajoExtendido | null) => {
        setState((prev: LegajoState) => ({ ...prev, legajoSeleccionado: legajo }));
    }, []);

    // Función para limpiar cache
    const clearCache = useCallback(() => {
        cacheService.clear();
        loggingService.info('Cache limpiado', 'SeleccionarFila');
    }, []);

    // Función para obtener estadísticas del cache
    const getCacheStats = useCallback(() => {
        return cacheService.getStats();
    }, []);

    // Función para obtener logs
    const getLogs = useCallback(() => {
        return loggingService.getLogs();
    }, []);

    // Función para limpiar logs
    const clearLogs = useCallback(() => {
        loggingService.clearLogs();
    }, []);

    // Limpiar AbortController al desmontar
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Memoizar el objeto de retorno para evitar re-renders innecesarios
    const returnValue = useMemo(() => ({
        // Estado principal
        legajoSeleccionado: state.legajoSeleccionado,
        isLoading: state.isLoading,
        error: state.error,
        
        // Funciones principales
        setLegajoSeleccionado,
        seleccionarFila,
        
        // Funciones de cache
        clearCache,
        getCacheStats,
        
        // Funciones de logging
        getLogs,
        clearLogs,
        
        // Nuevas funcionalidades de UX
        notifications: {
            subscribe: notificationService.subscribe,
            clear: notificationService.clear,
            getNotifications: notificationService.getNotifications,
            success: notificationService.success,
            error: notificationService.error,
            warning: notificationService.warning,
            info: notificationService.info,
            loading: notificationService.loading
        },
        progress: {
            subscribe: progressService.subscribe,
            getTracker: progressService.getTracker,
            getAllTrackers: progressService.getAllTrackers,
            getStats: progressService.getStats,
            createTracker: progressService.createTracker,
            updateStep: progressService.updateStep,
            completeTracker: progressService.completeTracker,
            cancelTracker: progressService.cancelTracker
        },
        retry: {
            getConfig: retryService.getConfig,
            updateConfig: retryService.updateConfig,
            execute: retryService.execute,
            executeRequest: retryService.executeRequest,
            executeCritical: retryService.executeCritical,
            executeFast: retryService.executeFast
        }
    }), [state.legajoSeleccionado, state.isLoading, state.error, setLegajoSeleccionado, seleccionarFila, clearCache, getCacheStats, getLogs, clearLogs]);

    return returnValue;
};

