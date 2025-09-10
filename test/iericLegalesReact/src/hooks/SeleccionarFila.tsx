import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { Legajo, LegajoExtendido, Acta, Articulo, EstadoHistorial, GiroHistorial } from '../utils/types';

type LegajoState = {
  legajoSeleccionado: LegajoExtendido | null;
  isLoading: boolean;
  error: string | null;
};

// Cache con TTL (Time To Live)
type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en milisegundos
};

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Instancia global del cache
const dataCache = new DataCache();

export const useSeleccionarFila = () => {
    const [state, setState] = useState<LegajoState>({
        legajoSeleccionado: null,
        isLoading: false,
        error: null
    });

    // Ref para AbortController
    const abortControllerRef = useRef<AbortController | null>(null);

    // Función helper para hacer fetch con cache y manejo de errores
    const fetchDataWithCache = useCallback(async <T,>(
        url: string, 
        errorMessage: string, 
        cacheKey: string,
        ttl: number = 5 * 60 * 1000 // 5 minutos por defecto
    ): Promise<T> => {
        // Verificar cache primero
        const cachedData = dataCache.get<T>(cacheKey);
        if (cachedData) {
            console.log(`📦 Cache hit para ${cacheKey}`);
            return cachedData;
        }

        try {
            const response = await fetch(url, {
                signal: abortControllerRef.current?.signal
            });
            
            if (response.status === 404) {
                console.warn(`${errorMessage}: No encontrado (404)`);
                const emptyData = [] as T;
                dataCache.set(cacheKey, emptyData, ttl);
                return emptyData;
            }
            
            if (!response.ok) {
                throw new Error(`${errorMessage}: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Guardar en cache
            dataCache.set(cacheKey, data, ttl);
            console.log(`💾 Datos guardados en cache para ${cacheKey}`);
            
            return data;
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log(`🚫 Request cancelado para ${cacheKey}`);
                throw error;
            }
            console.error(`${errorMessage}:`, error);
            throw error;
        }
    }, []);

    // Función helper para validar y formatear arrays (memoizada)
    const validateArray = useCallback(<T,>(data: unknown, fallback: T[] = []): T[] => {
        return Array.isArray(data) ? data : fallback;
    }, []);

    const seleccionarFila = useCallback(async (item: Legajo) => {
        console.log('Seleccionando fila:', { id: item.id, legajo: item.legajo });
        
        // Cancelar request anterior si existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Crear nuevo AbortController
        abortControllerRef.current = new AbortController();
        
        setState((prev: LegajoState) => ({ ...prev, isLoading: true, error: null }));

        try {
            // Generar claves de cache únicas
            const cacheKeys = {
                actas: `actas_${item.id}`,
                articulos: `articulos_${item.id}`,
                historialEstados: `historial_estados_${item.id}`,
                historialGiros: `historial_giros_${item.id}`
            };

            // Ejecutar todos los requests en paralelo con cache
            const [actaData, articuloData, historialData, girosData] = await Promise.allSettled([
                fetchDataWithCache<Acta[]>(
                    `https://localhost:44372/v1/Acta/PorLegajo/${item.id}`, 
                    'Error obteniendo actas',
                    cacheKeys.actas,
                    10 * 60 * 1000 // 10 minutos para actas
                ),
                fetchDataWithCache<Articulo[]>(
                    `https://localhost:44372/v1/LegajoArticulo/ById/${item.id}`, 
                    'Error obteniendo artículos',
                    cacheKeys.articulos,
                    15 * 60 * 1000 // 15 minutos para artículos
                ),
                fetchDataWithCache<EstadoHistorial[]>(
                    `https://localhost:44372/v1/legajos/HistorialEstadosPorId?legajoId=${item.id}`, 
                    'Error obteniendo historial de estados',
                    cacheKeys.historialEstados,
                    30 * 60 * 1000 // 30 minutos para historial
                ),
                fetchDataWithCache<GiroHistorial[]>(
                    `https://localhost:44372/v1/legajos/HistorialGirosPorId?legajoId=${item.id}`, 
                    'Error obteniendo historial de giros',
                    cacheKeys.historialGiros,
                    30 * 60 * 1000 // 30 minutos para historial
                )
            ]);

            // Procesar resultados de cada request
            const actas = actaData.status === 'fulfilled' ? validateArray<Acta>(actaData.value) : [];
            const articulos = articuloData.status === 'fulfilled' ? validateArray<Articulo>(articuloData.value) : [];
            const historialEstados = historialData.status === 'fulfilled' ? validateArray<EstadoHistorial>(historialData.value) : [];
            const historialGiros = girosData.status === 'fulfilled' ? validateArray<GiroHistorial>(girosData.value) : [];

            // Log de datos obtenidos para debugging
            console.log('Datos obtenidos:', {
                actas: actas.length,
                articulos: articulos.length,
                historialEstados: historialEstados.length,
                historialGiros: historialGiros.length,
                cacheSize: dataCache.size()
            });

            // Crear el objeto legajo extendido con todos los datos
            const legajoExtendido: LegajoExtendido = {
                ...item,
                nroActa: actas[0]?.nroActa ?? null,
                articulo: articulos[0] ?? null,
                actas,
                legajoArticulos: articulos,
                historialEstados,
                historialGiros,
            };

            setState({
                legajoSeleccionado: legajoExtendido,
                isLoading: false,
                error: null
            });

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('🚫 Selección de fila cancelada');
                return; // No actualizar estado si fue cancelado
            }

            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar datos del legajo';
            console.error('Error al seleccionar fila:', error);
            
            setState({
                legajoSeleccionado: item, // Fallback al item original
                isLoading: false,
                error: errorMessage
            });
        }
    }, [fetchDataWithCache, validateArray]);

    const setLegajoSeleccionado = useCallback((legajo: LegajoExtendido | null) => {
        setState((prev: LegajoState) => ({ ...prev, legajoSeleccionado: legajo }));
    }, []);

    // Función para limpiar cache
    const clearCache = useCallback(() => {
        dataCache.clear();
        console.log('🗑️ Cache limpiado');
    }, []);

    // Función para obtener estadísticas del cache
    const getCacheStats = useCallback(() => {
        return {
            size: dataCache.size(),
            hasData: dataCache.has('actas_') || dataCache.has('articulos_') || dataCache.has('historial_estados_') || dataCache.has('historial_giros_')
        };
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
        getCacheStats
    }), [state.legajoSeleccionado, state.isLoading, state.error, setLegajoSeleccionado, seleccionarFila, clearCache, getCacheStats]);

    return returnValue;
};
