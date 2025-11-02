// hooks/useClientDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import { clientDashboardService, DashboardData } from '@/services/clientDashboard.service';

// Estados del dashboard
interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

interface UseClientDashboardOptions {
  brandId: number;
  autoRefreshInterval?: number; // en minutos
}

export const useClientDashboard = ({ brandId, autoRefreshInterval }: UseClientDashboardOptions) => {
  const [state, setState] = useState<DashboardState>({
    data: null,
    loading: false,
    error: null,
    refreshing: false,
  });

  // Cargar datos del dashboard
  const loadDashboard = useCallback(async (silent: boolean = false) => {
    if (!silent) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      const dashboardData = await clientDashboardService.getDashboardData(brandId);
      setState(prev => ({
        ...prev,
        data: dashboardData,
        loading: false,
        refreshing: false,
        error: null,
      }));
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: error instanceof Error ? error.message : 'Error al cargar el dashboard',
      }));
    }
  }, [brandId]);

  // Refrescar datos (para pull-to-refresh)
  const refreshDashboard = useCallback(async () => {
    setState(prev => ({ ...prev, refreshing: true, error: null }));
    await loadDashboard(true);
  }, [loadDashboard]);

  // Recargar datos por completo
  const reloadDashboard = useCallback(async () => {
    await loadDashboard(false);
  }, [loadDashboard]);

  // Actualizar datos específicos sin recargar todo
  const updateProfile = useCallback(async () => {
    if (!state.data) return;
    
    try {
      const profile = await clientDashboardService.getClientProfileData(brandId);
      setState(prev => ({
        ...prev,
        data: prev.data ? { ...prev.data, profile } : null,
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, [brandId, state.data]);

  const updateStats = useCallback(async () => {
    if (!state.data) return;
    
    try {
      const appointmentData = await clientDashboardService.getAppointmentStats(brandId);
      setState(prev => ({
        ...prev,
        data: prev.data ? {
          ...prev.data,
          stats: appointmentData.stats,
          recentAppointments: appointmentData.recentAppointments,
          todayAppointments: appointmentData.todayAppointments,
        } : null,
      }));
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }, [brandId, state.data]);

  // Limpiar error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Obtener datos filtrados
  const getTodayAppointments = useCallback(() => {
    return state.data?.todayAppointments || [];
  }, [state.data]);

  const getUpcomingAppointments = useCallback(() => {
    return state.data?.recentAppointments || [];
  }, [state.data]);

  const getActiveServices = useCallback(() => {
    return state.data?.availableServices.filter(service => service.isActive) || [];
  }, [state.data]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefreshInterval && autoRefreshInterval > 0) {
      const interval = setInterval(() => {
        loadDashboard(true); // Refresh silencioso
      }, autoRefreshInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval, loadDashboard]);

  // Carga inicial
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    // Estado
    data: state.data,
    loading: state.loading,
    error: state.error,
    refreshing: state.refreshing,
    
    // Acciones
    refresh: refreshDashboard,
    reload: reloadDashboard,
    updateProfile,
    updateStats,
    clearError,
    
    // Datos filtrados
    todayAppointments: getTodayAppointments(),
    upcomingAppointments: getUpcomingAppointments(),
    activeServices: getActiveServices(),
    
    // Estadísticas rápidas
    stats: state.data?.stats || {
      totalAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      pendingAppointments: 0,
      upcomingAppointments: 0,
      pastAppointments: 0,
    },
    
    // Estado de carga
    isEmpty: !state.loading && !state.data,
    hasData: !!state.data,
    hasError: !!state.error,
  };
};