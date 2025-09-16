import { useState, useEffect, useCallback } from 'react';
import {
    HistoryItem,
    HistoryFilters,
    ClientHistoryState,
    ClientHistoryActions,
    HistoryStats,
    HistoryItemType,
} from '@/types/history.types';

// Datos mock para testing
const mockHistoryData: HistoryItem[] = [
    {
        id: 'h1',
        type: 'appointment',
        date: '2024-12-08T10:00:00Z',
        title: 'Corte de Cabello Premium',
        subtitle: 'María González - 10:00 AM',
        amount: 450,
        status: 'completed',
        details: {
            serviceName: 'Corte de Cabello Premium',
            duration: 60,
            professional: 'María González',
            time: '10:00 AM',
            serviceId: 'svc_1',
            notes: 'Cliente muy satisfecho con el resultado',
        },
    },
    {
        id: 'h2',
        type: 'payment',
        date: '2024-12-08T10:45:00Z',
        title: 'Pago - Corte Premium',
        subtitle: 'Tarjeta de crédito ****1234',
        amount: 450,
        status: 'completed',
        details: {
            method: 'credit_card',
            receipt: 'RCP-20241208-001',
            serviceAssociated: 'Corte de Cabello Premium',
            transactionId: 'txn_abc123',
            currency: 'MXN',
        },
    },
    {
        id: 'h3',
        type: 'appointment',
        date: '2024-12-05T14:30:00Z',
        title: 'Tinte y Mechas',
        subtitle: 'Ana Rodríguez - 2:30 PM',
        amount: 890,
        status: 'completed',
        details: {
            serviceName: 'Tinte y Mechas',
            duration: 120,
            professional: 'Ana Rodríguez',
            time: '2:30 PM',
            serviceId: 'svc_2',
            notes: 'Cambio de look exitoso',
        },
    },
    {
        id: 'h4',
        type: 'payment',
        date: '2024-12-05T16:30:00Z',
        title: 'Pago - Tinte y Mechas',
        subtitle: 'Efectivo',
        amount: 890,
        status: 'completed',
        details: {
            method: 'cash',
            receipt: 'RCP-20241205-003',
            serviceAssociated: 'Tinte y Mechas',
            transactionId: 'txn_cash001',
            currency: 'MXN',
        },
    },
    {
        id: 'h5',
        type: 'appointment',
        date: '2024-11-28T11:00:00Z',
        title: 'Tratamiento Capilar',
        subtitle: 'Luis Martínez - 11:00 AM',
        amount: 650,
        status: 'completed',
        details: {
            serviceName: 'Tratamiento Capilar Nutritivo',
            duration: 90,
            professional: 'Luis Martínez',
            time: '11:00 AM',
            serviceId: 'svc_3',
            notes: 'Cabello más fuerte y brillante',
        },
    },
    {
        id: 'h6',
        type: 'appointment',
        date: '2024-11-20T09:15:00Z',
        title: 'Manicure Francesa',
        subtitle: 'Carmen Silva - 9:15 AM',
        amount: 280,
        status: 'completed',
        details: {
            serviceName: 'Manicure Francesa',
            duration: 45,
            professional: 'Carmen Silva',
            time: '9:15 AM',
            serviceId: 'svc_4',
        },
    },
    {
        id: 'h7',
        type: 'appointment',
        date: '2024-11-15T16:00:00Z',
        title: 'Corte y Peinado',
        subtitle: 'María González - 4:00 PM',
        amount: 380,
        status: 'cancelled',
        details: {
            serviceName: 'Corte y Peinado',
            duration: 60,
            professional: 'María González',
            time: '4:00 PM',
            serviceId: 'svc_1',
            notes: 'Cancelado por emergencia familiar',
        },
    },
    {
        id: 'h8',
        type: 'appointment',
        date: '2024-12-15T13:00:00Z',
        title: 'Facial Hidratante',
        subtitle: 'Sofia Reyes - 1:00 PM',
        amount: 520,
        status: 'confirmed',
        details: {
            serviceName: 'Facial Hidratante',
            duration: 75,
            professional: 'Sofia Reyes',
            time: '1:00 PM',
            serviceId: 'svc_5',
        },
    },
    {
        id: 'h9',
        type: 'service',
        date: '2024-10-30T10:30:00Z',
        title: 'Evaluación Servicio',
        subtitle: 'Corte de Cabello - Calificación: 5⭐',
        status: 'completed',
        details: {
            description: 'Excelente servicio, muy profesional',
            category: 'Cabello',
            rating: 5,
            review: 'María es increíble, siempre sabe exactamente lo que necesito',
            professionalId: 'prof_maria',
        },
    },
    {
        id: 'h10',
        type: 'appointment',
        date: '2024-10-25T15:45:00Z',
        title: 'Pedicure Spa',
        subtitle: 'Carmen Silva - 3:45 PM',
        amount: 320,
        status: 'completed',
        details: {
            serviceName: 'Pedicure Spa',
            duration: 60,
            professional: 'Carmen Silva',
            time: '3:45 PM',
            serviceId: 'svc_6',
        },
    },
];

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

    // Simular carga inicial
    useEffect(() => {
        const loadInitialData = setTimeout(() => {
            setState(prev => ({
                ...prev,
                items: mockHistoryData,
                filteredItems: applyFilters(mockHistoryData, defaultFilters),
                loading: false,
            }));
        }, 1000);

        return () => clearTimeout(loadInitialData);
    }, []);

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

        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 500));

        setState(prev => ({
            ...prev,
            items: mockHistoryData,
            filteredItems: applyFilters(mockHistoryData, prev.filters),
            loading: false,
            page: 1,
            hasMore: true,
        }));
    }, [applyFilters]);

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
