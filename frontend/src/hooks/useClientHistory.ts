import { useState, useEffect, useCallback } from 'react';
import {
    HistoryItem,
    HistoryFilters,
    ClientHistoryState,
    ClientHistoryActions,
    HistoryStats,
    HistoryItemType,
} from '@/types/history.types';
import { useClientAppointments } from './useClientAppointments';

// Convertir citas a items de historial para compatibilidad con el componente existente
const convertAppointmentsToHistoryItems = (appointments: any[]): HistoryItem[] => {
    return appointments.map(apt => ({
        id: `appointment-${apt.id}`,
        type: 'appointment' as const,
        date: apt.startTime,
        title: apt.notes || 'Cita programada',
        subtitle: `${apt.displayDate || new Date(apt.startTime).toLocaleDateString()} • ${apt.displayTime || new Date(apt.startTime).toLocaleTimeString()}`,
        status: apt.status.toLowerCase() === 'pending' ? 'pending' : 
                apt.status.toLowerCase() === 'confirmed' ? 'confirmed' :
                apt.status.toLowerCase() === 'completed' ? 'completed' : 'cancelled',
        details: {
            serviceName: apt.notes || 'Servicio general',
            duration: apt.duration,
            professional: 'Profesional asignado', // Por ahora valor por defecto
            time: apt.displayTime || new Date(apt.startTime).toLocaleTimeString(),
            serviceId: `svc_${apt.id}`,
            notes: apt.notes,
        },
    }));
};

const defaultFilters: HistoryFilters = {
    types: ['appointment', 'payment', 'service'],
    sortOrder: 'desc',
};

export const useClientHistory = (): ClientHistoryState & ClientHistoryActions => {
    const [state, setState] = useState<ClientHistoryState>({
        items: [],
        filteredItems: [],
        loading: true,
        hasMore: true,
        page: 1,
        filters: defaultFilters,
    });

    // Hook para obtener citas reales
    const { appointments, loading: appointmentsLoading, error } = useClientAppointments();

    // Cargar datos reales cuando lleguen las citas
    useEffect(() => {
        if (!appointmentsLoading && appointments) {
            const historyItems = convertAppointmentsToHistoryItems(appointments);
            setState(prev => ({
                ...prev,
                items: historyItems,
                filteredItems: applyFilters(historyItems, prev.filters),
                loading: false,
            }));
        }
    }, [appointments, appointmentsLoading]);

    // Aplicar filtros a los datos
    const applyFilters = useCallback((items: HistoryItem[], filters: HistoryFilters): HistoryItem[] => {
        let filtered = [...items];

        // Filtrar por tipos
        if (filters.types.length > 0) {
            filtered = filtered.filter(item => filters.types.includes(item.type));
        }

        // Filtrar por estado
        if (filters.status && filters.status.length > 0) {
            filtered = filtered.filter(item => filters.status!.includes(item.status));
        }

        // Filtrar por rango de fechas
        if (filters.startDate) {
            filtered = filtered.filter(item => new Date(item.date) >= new Date(filters.startDate!));
        }

        if (filters.endDate) {
            filtered = filtered.filter(item => new Date(item.date) <= new Date(filters.endDate!));
        }

        // Ordenar
        filtered.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return filters.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    }, []);

    // Actualizar filtros
    const updateFilters = useCallback((newFilters: Partial<HistoryFilters>) => {
        setState(prev => {
            const updatedFilters = { ...prev.filters, ...newFilters };
            return {
                ...prev,
                filters: updatedFilters,
                filteredItems: applyFilters(prev.items, updatedFilters),
            };
        });
    }, [applyFilters]);

    // Resetear filtros
    const resetFilters = useCallback(() => {
        setState(prev => ({
            ...prev,
            filters: defaultFilters,
            filteredItems: applyFilters(prev.items, defaultFilters),
        }));
    }, [applyFilters]);

    // Cargar más datos (simulado)
    const loadMore = useCallback(async () => {
        if (!state.hasMore || state.loading) return;

        setState(prev => ({ ...prev, loading: true }));

        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 800));

        setState(prev => ({
            ...prev,
            loading: false,
            page: prev.page + 1,
            hasMore: prev.page < 2, // Limitar a 2 páginas por simplicidad
        }));
    }, [state.hasMore, state.loading]);

    // Refresh datos
    const refresh = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true }));

        try {
            // Los datos se actualizarán automáticamente cuando el hook useClientAppointments refresque
            // Este método está aquí para compatibilidad con la interfaz existente
            if (appointments) {
                const historyItems = convertAppointmentsToHistoryItems(appointments);
                setState(prev => ({
                    ...prev,
                    items: historyItems,
                    filteredItems: applyFilters(historyItems, prev.filters),
                    loading: false,
                    page: 1,
                    hasMore: true,
                }));
            }
        } catch (error) {
            console.error('Error refreshing history:', error);
            setState(prev => ({ ...prev, loading: false }));
        }
    }, [appointments, applyFilters]);

    // Obtener item por ID
    const getItemById = useCallback((id: string): HistoryItem | undefined => {
        return state.items.find(item => item.id === id);
    }, [state.items]);

    return {
        ...state,
        loadMore,
        refresh,
        updateFilters,
        resetFilters,
        getItemById,
    };
};

// Hook para estadísticas del historial
export const useHistoryStats = (): HistoryStats => {
    const { items } = useClientHistory();

    const stats = (): HistoryStats => {
        const appointments = items.filter(item => item.type === 'appointment');
        const completed = appointments.filter(item => item.status === 'completed');
        const cancelled = appointments.filter(item => item.status === 'cancelled');
        const payments = items.filter(item => item.type === 'payment' && item.status === 'completed');
        const services = items.filter(item => item.type === 'service');

        const totalSpent = payments.reduce((sum, item) => sum + (item.amount || 0), 0);
        const averageRating = services.reduce((sum, item) => {
            const rating = (item.details as any).rating || 0;
            return sum + rating;
        }, 0) / Math.max(services.length, 1);

        return {
            totalAppointments: appointments.length,
            completedAppointments: completed.length,
            cancelledAppointments: cancelled.length,
            totalSpent,
            totalSessions: completed.length,
            averageRating: Math.round(averageRating * 10) / 10,
        };
    };

    return stats();
};
