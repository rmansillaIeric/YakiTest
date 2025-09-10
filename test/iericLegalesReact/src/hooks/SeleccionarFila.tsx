import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { Legajo, LegajoExtendido } from '../utils/types';
import { apiService, cacheService, configService, loggingService } from '../services';

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

    // Función helper para obtener datos con cache usando servicios
    const fetchDataWithCache = useCallback(async (legajoId: string) => {
        const cacheKey = `legajo_${legajoId}`;
        
        // Verificar cache primero
        if (cacheService.has(cacheKey)) {
            loggingService.info('Cache hit', 'SeleccionarFila', { legajoId, cacheKey });
            return cacheService.get(cacheKey);
        }

        try {
            loggingService.info('Obteniendo datos del legajo', 'SeleccionarFila', { legajoId });
            
            // Usar servicio de API
            const data = await apiService.getLegajoData(legajoId);
            
            // Guardar en cache
            const ttl = configService.getCacheDefaultTtl();
            cacheService.set(cacheKey, data, ttl);
            
            loggingService.info('Datos obtenidos y guardados en cache', 'SeleccionarFila', { 
                legajoId, 
                cacheKey,
                actas: data.actas.length,
                articulos: data.articulos.length,
                historialEstados: data.historialEstados.length,
                historialGiros: data.historialGiros.length
            });
            
            return data;
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                loggingService.warn('Request cancelado', 'SeleccionarFila', { legajoId });
                throw error;
            }
            
            loggingService.error('Error obteniendo datos del legajo', 'SeleccionarFila', { 
                legajoId, 
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
            
            throw error;
        }
    }, []);

    // Función helper para validar y formatear arrays (memoizada)
    const validateArray = useCallback(<T,>(data: unknown, fallback: T[] = []): T[] => {
        return Array.isArray(data) ? data : fallback;
    }, []);

    const seleccionarFila = useCallback(async (item: Legajo) => {
        loggingService.info('Seleccionando fila', 'SeleccionarFila', { 
            id: item.id, 
            legajo: item.legajo 
        });
        
        // Cancelar request anterior si existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Crear nuevo AbortController
        abortControllerRef.current = new AbortController();
        
        setState((prev: LegajoState) => ({ ...prev, isLoading: true, error: null }));

        try {
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

            loggingService.info('Fila seleccionada exitosamente', 'SeleccionarFila', {
                legajoId: item.id,
                cacheStats: cacheService.getStats()
            });

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                loggingService.warn('Selección de fila cancelada', 'SeleccionarFila');
                return; // No actualizar estado si fue cancelado
            }

            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar datos del legajo';
            
            setState({
                legajoSeleccionado: item, // Fallback al item original
                isLoading: false,
                error: errorMessage
            });

            loggingService.error('Error al seleccionar fila', 'SeleccionarFila', {
                legajoId: item.id,
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
        legajoSeleccionado: state.legajoSeleccionado,
        isLoading: state.isLoading,
        error: state.error,
        setLegajoSeleccionado,
        seleccionarFila,
        clearCache,
        getCacheStats,
        getLogs,
        clearLogs
    }), [state.legajoSeleccionado, state.isLoading, state.error, setLegajoSeleccionado, seleccionarFila, clearCache, getCacheStats, getLogs, clearLogs]);

    return returnValue;
};

