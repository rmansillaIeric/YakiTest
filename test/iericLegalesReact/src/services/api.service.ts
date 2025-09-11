import type { Acta, Articulo, EstadoHistorial, GiroHistorial } from '../utils/types';

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: 'https://localhost:44372/v1',
  ENDPOINTS: {
    ACTAS: '/Acta/PorLegajo',
    ARTICULOS: '/LegajoArticulo/ById',
    HISTORIAL_ESTADOS: '/legajos/HistorialEstadosPorId',
    HISTORIAL_GIROS: '/legajos/HistorialGirosPorId'
  },
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3
};

// Tipos para las respuestas de la API
export type ApiResponse<T> = {
  data: T;
  success: boolean;
  error?: string;
};

export type ApiError = {
  message: string;
  status: number;
  code: string;
};

// Clase para manejar requests HTTP
export class ApiService {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;

  constructor(
    baseUrl: string = API_CONFIG.BASE_URL,
    timeout: number = API_CONFIG.TIMEOUT,
    retryAttempts: number = API_CONFIG.RETRY_ATTEMPTS
  ) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
    this.retryAttempts = retryAttempts;
  }

  // Método genérico para hacer requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (response.status === 404) {
        console.warn(`API: No encontrado (404) - ${endpoint}`);
        return [] as T;
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout: ${endpoint}`);
      }

      // Retry logic
      if (retryCount < this.retryAttempts) {
        console.warn(`API: Retry ${retryCount + 1}/${this.retryAttempts} for ${endpoint}`);
        await this.delay(1000 * (retryCount + 1)); // Exponential backoff
        return this.makeRequest<T>(endpoint, options, retryCount + 1);
      }

      throw error;
    }
  }

  // Delay helper
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Métodos específicos para cada endpoint
  async getActas(legajoId: string): Promise<Acta[]> {
    return this.makeRequest<Acta[]>(`${API_CONFIG.ENDPOINTS.ACTAS}/${legajoId}`);
  }

  async getArticulos(legajoId: string): Promise<Articulo[]> {
    return this.makeRequest<Articulo[]>(`${API_CONFIG.ENDPOINTS.ARTICULOS}/${legajoId}`);
  }

  async getHistorialEstados(legajoId: string): Promise<EstadoHistorial[]> {
    return this.makeRequest<EstadoHistorial[]>(`${API_CONFIG.ENDPOINTS.HISTORIAL_ESTADOS}?legajoId=${legajoId}`);
  }

  async getHistorialGiros(legajoId: string): Promise<GiroHistorial[]> {
    return this.makeRequest<GiroHistorial[]>(`${API_CONFIG.ENDPOINTS.HISTORIAL_GIROS}?legajoId=${legajoId}`);
  }

  // Método para obtener todos los datos de un legajo
  async getLegajoData(legajoId: string): Promise<{
    actas: Acta[];
    articulos: Articulo[];
    historialEstados: EstadoHistorial[];
    historialGiros: GiroHistorial[];
  }> {
    try {
      const [actas, articulos, historialEstados, historialGiros] = await Promise.allSettled([
        this.getActas(legajoId),
        this.getArticulos(legajoId),
        this.getHistorialEstados(legajoId),
        this.getHistorialGiros(legajoId)
      ]);

      return {
        actas: actas.status === 'fulfilled' ? actas.value : [],
        articulos: articulos.status === 'fulfilled' ? articulos.value : [],
        historialEstados: historialEstados.status === 'fulfilled' ? historialEstados.value : [],
        historialGiros: historialGiros.status === 'fulfilled' ? historialGiros.value : []
      };
    } catch (error) {
      console.error('Error obteniendo datos del legajo:', error);
      throw error;
    }
  }
}

// Instancia singleton del servicio
export const apiService = new ApiService();
