 import { useState, useCallback } from 'react';
import type { Legajo, LegajoExtendido, Acta, Articulo, EstadoHistorial, GiroHistorial } from '../utils/types';

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

    // Función helper para hacer fetch con manejo de errores
    const fetchData = async <T,>(url: string, errorMessage: string): Promise<T> => {
        try {
            const response = await fetch(url);
            
            if (response.status === 404) {
                console.warn(`${errorMessage}: No encontrado (404)`);
                return [] as T;
            }
            
            if (!response.ok) {
                throw new Error(`${errorMessage}: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`${errorMessage}:`, error);
            throw error;
        }
    };

    // Función helper para validar y formatear arrays
    const validateArray = <T,>(data: unknown, fallback: T[] = []): T[] => {
        return Array.isArray(data) ? data : fallback;
    };

    const seleccionarFila = useCallback(async (item: Legajo) => {
        console.log('Seleccionando fila:', { id: item.id, legajo: item.legajo });
        
        setState((prev: LegajoState) => ({ ...prev, isLoading: true, error: null }));

        try {
            // Ejecutar todos los requests en paralelo para mejor rendimiento
            const [actaData, articuloData, historialData, girosData] = await Promise.allSettled([
                fetchData<Acta[]>(`https://localhost:44372/v1/Acta/PorLegajo/${item.id}`, 'Error obteniendo actas'),
                fetchData<Articulo[]>(`https://localhost:44372/v1/LegajoArticulo/ById/${item.id}`, 'Error obteniendo artículos'),
                fetchData<EstadoHistorial[]>(`https://localhost:44372/v1/legajos/HistorialEstadosPorId?legajoId=${item.id}`, 'Error obteniendo historial de estados'),
                fetchData<GiroHistorial[]>(`https://localhost:44372/v1/legajos/HistorialGirosPorId?legajoId=${item.id}`, 'Error obteniendo historial de giros')
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
                historialGiros: historialGiros.length
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
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar datos del legajo';
            console.error('Error al seleccionar fila:', error);
            
            setState({
                legajoSeleccionado: item, // Fallback al item original
                isLoading: false,
                error: errorMessage
            });
        }
    }, []);

    const setLegajoSeleccionado = useCallback((legajo: LegajoExtendido | null) => {
      setState((prev: LegajoState) => ({ ...prev, legajoSeleccionado: legajo }));
    }, []);

    return {
        legajoSeleccionado: state.legajoSeleccionado,
        isLoading: state.isLoading,
        error: state.error,
        setLegajoSeleccionado,
        seleccionarFila,
    };
};
