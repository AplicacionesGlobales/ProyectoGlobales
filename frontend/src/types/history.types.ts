// Tipos para el historial del cliente
export type HistoryItemType = 'appointment' | 'payment' | 'service';

export type HistoryStatus = 'completed' | 'cancelled' | 'pending' | 'confirmed';

export interface BaseHistoryItem {
    id: string;
    type: HistoryItemType;
    date: string; // ISO string
    title: string;
    subtitle: string;
    amount?: number;
    status: HistoryStatus;
}

export interface AppointmentDetails {
    serviceName: string;
    duration: number; // en minutos
    professional: string;
    time: string;
    serviceId: string;
    notes?: string;
}

export interface PaymentDetails {
    method: 'credit_card' | 'debit_card' | 'cash' | 'transfer';
    receipt: string;
    serviceAssociated: string;
    transactionId: string;
    currency: string;
}

export interface ServiceDetails {
    description: string;
    category: string;
    rating?: number;
    review?: string;
    professionalId: string;
}

export interface HistoryItemAppointment extends BaseHistoryItem {
    type: 'appointment';
    details: AppointmentDetails;
}

export interface HistoryItemPayment extends BaseHistoryItem {
    type: 'payment';
    details: PaymentDetails;
}

export interface HistoryItemService extends BaseHistoryItem {
    type: 'service';
    details: ServiceDetails;
}

export type HistoryItem = HistoryItemAppointment | HistoryItemPayment | HistoryItemService;

// Filtros para el historial
export interface HistoryFilters {
    startDate?: string;
    endDate?: string;
    types: HistoryItemType[];
    status?: HistoryStatus[];
    sortOrder: 'asc' | 'desc';
}

// Estado del hook useClientHistory
export interface ClientHistoryState {
    items: HistoryItem[];
    filteredItems: HistoryItem[];
    loading: boolean;
    hasMore: boolean;
    page: number;
    filters: HistoryFilters;
}

// Acciones del hook
export interface ClientHistoryActions {
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
    updateFilters: (filters: Partial<HistoryFilters>) => void;
    resetFilters: () => void;
    getItemById: (id: string) => HistoryItem | undefined;
}

// Stats del historial
export interface HistoryStats {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    totalSpent: number;
    totalSessions: number;
    averageRating: number;
}
