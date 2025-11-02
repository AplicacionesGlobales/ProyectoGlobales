// hooks/useClientAppointments.ts (Refactorizado para usar estructura API existente)

import { useState, useEffect, useCallback } from 'react';
import { getClientAppointments } from '@/api/endpoints';
import { getBrandId } from '@/utils/brandUtils';
import {
  ClientAppointmentDto,
  ClientAppointmentSummary,
  ClientAppointmentPagination,
  GetClientAppointmentsQuery
} from '@/api/types';

interface UseClientAppointmentsOptions {
  brandId?: number;
  autoLoad?: boolean;
}

interface ClientAppointmentsHookResult {
  // Data
  appointments: ClientAppointmentDto[];
  summary: ClientAppointmentSummary;
  pagination: ClientAppointmentPagination;
  
  // States
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasMore: boolean;
  
  // Actions
  loadAppointments: (filters?: GetClientAppointmentsQuery) => Promise<void>;
  refreshAppointments: () => Promise<void>;
  loadMore: () => Promise<void>;
  getAppointmentById: (id: number) => ClientAppointmentDto | undefined;
}

const defaultSummary: ClientAppointmentSummary = {
  totalAppointments: 0,
  completedAppointments: 0,
  cancelledAppointments: 0,
  pendingAppointments: 0,
};

const defaultPagination: ClientAppointmentPagination = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
};

export const useClientAppointments = (options: UseClientAppointmentsOptions = {}): ClientAppointmentsHookResult => {
  const { 
    brandId = getBrandId(), 
    autoLoad = true 
  } = options;

  const [appointments, setAppointments] = useState<ClientAppointmentDto[]>([]);
  const [summary, setSummary] = useState<ClientAppointmentSummary>(defaultSummary);
  const [pagination, setPagination] = useState<ClientAppointmentPagination>(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<GetClientAppointmentsQuery>({});

  // Cargar citas
  const loadAppointments = useCallback(async (filters: GetClientAppointmentsQuery = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📅 Cargando citas para brandId:', brandId, 'con filtros:', filters);
      
      const response = await getClientAppointments(brandId, filters);
      
      if (response.success && response.data) {
        setAppointments(response.data.appointments);
        setSummary(response.data.summary);
        setPagination(response.data.pagination);
        setCurrentFilters(filters);
      } else {
        throw new Error('Error al cargar las citas');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error loading appointments:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  // Refrescar citas
  const refreshAppointments = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      console.log('🔄 Refrescando citas...');
      
      const response = await getClientAppointments(brandId, currentFilters);
      
      if (response.success && response.data) {
        setAppointments(response.data.appointments);
        setSummary(response.data.summary);
        setPagination(response.data.pagination);
      } else {
        throw new Error('Error al refrescar las citas');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error refreshing appointments:', err);
      setError(errorMessage);
    } finally {
      setRefreshing(false);
    }
  }, [brandId, currentFilters]);

  // Cargar más citas (paginación)
  const loadMore = useCallback(async () => {
    if (loading || refreshing || !hasMore) return;

    try {
      setLoading(true);
      
      const nextPage = pagination.page + 1;
      console.log('📄 Cargando página:', nextPage);
      
      const response = await getClientAppointments(brandId, {
        ...currentFilters,
        page: nextPage
      });
      
      if (response.success && response.data) {
        setAppointments(prev => [...prev, ...response.data!.appointments]);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error loading more appointments:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [brandId, currentFilters, pagination.page, loading, refreshing]);

  // Buscar cita por ID
  const getAppointmentById = useCallback((id: number): ClientAppointmentDto | undefined => {
    return appointments.find(appointment => appointment.id === id);
  }, [appointments]);

  // Calcular si hay más páginas
  const hasMore = pagination.page < pagination.totalPages;

  // Cargar datos inicialmente
  useEffect(() => {
    if (autoLoad) {
      loadAppointments();
    }
  }, [autoLoad, loadAppointments]);

  return {
    // Data
    appointments,
    summary,
    pagination,
    
    // States
    loading,
    refreshing,
    error,
    hasMore,
    
    // Actions
    loadAppointments,
    refreshAppointments,
    loadMore,
    getAppointmentById,
  };
};