// components/Appointments/ClientAppointmentHistory.tsx

import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  RefreshControl, 
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useClientAppointments } from '../../hooks/useClientAppointments';
import { ClientAppointmentDto, GetClientAppointmentsQuery } from '../../api/types';
// import { AppointmentStats } from './AppointmentStats';
// import { AppointmentItem } from './AppointmentItem';
// import { AppointmentFilters } from './AppointmentFilters';

interface ClientAppointmentHistoryProps {
  showTitle?: boolean;
  maxItems?: number; // Para vista compacta
  onSeeAll?: () => void; // Callback para ver historial completo
  compact?: boolean; // Modo compacto para usar en otras pantallas
}

export const ClientAppointmentHistory: React.FC<ClientAppointmentHistoryProps> = ({
  showTitle = true,
  maxItems,
  onSeeAll,
  compact = false,
}) => {
  const { colors } = useTheme();
  const {
    appointments,
    summary,
    loading,
    refreshing,
    hasMore,
    error,
    refreshAppointments,
    loadMore,
    loadAppointments,
  } = useClientAppointments();

  // Estado local para filtros
  const [filters, setFilters] = useState<GetClientAppointmentsQuery>({});
  const [selectedAppointment, setSelectedAppointment] = useState<ClientAppointmentDto | null>(null);

  // Filtrar appointments localmente (simple)
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];
    
    if (filters.status) {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }
    
    return filtered;
  }, [appointments, filters]);

  // Limitar items si es vista compacta
  const displayItems = maxItems 
    ? filteredAppointments.slice(0, maxItems) 
    : filteredAppointments;

  // Funciones de filtros
  const updateFilters = (newFilters: Partial<GetClientAppointmentsQuery>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    loadAppointments(updatedFilters);
  };

  const resetFilters = () => {
    setFilters({});
    loadAppointments({});
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Función para formatear hora
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener texto del estado
  const getStatusText = (status: string) => {
    const statusMap = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmada',
      'IN_PROGRESS': 'En Progreso',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada',
      'NO_SHOW': 'No asistió'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  // Manejar selección de cita
  const handleAppointmentPress = (appointment: ClientAppointmentDto) => {
    setSelectedAppointment(appointment);
    
    // Mostrar detalles de la cita
    Alert.alert(
      'Detalles de la Cita',
      `Estado: ${getStatusText(appointment.status)}\n` +
      `Fecha: ${formatDate(appointment.appointmentDate)}\n` +
      `Hora: ${formatTime(appointment.appointmentTime)}\n` +
      `Duración: ${appointment.duration} minutos` +
      (appointment.notes ? `\n\nNotas: ${appointment.notes}` : ''),
      [
        { text: 'Cerrar', style: 'cancel' },
        // Aquí se pueden agregar más acciones como cancelar, reprogramar, etc.
      ]
    );
  };

  // Manejar carga de más datos
  const handleLoadMore = () => {
    if (!loading && hasMore && !compact) {
      loadMore();
    }
  };

  // Transformar ClientAppointmentDto a formato que espera AppointmentItem
  const transformAppointment = (appointment: ClientAppointmentDto) => ({
    ...appointment,
    displayDate: formatDate(appointment.appointmentDate),
    displayTime: formatTime(appointment.appointmentTime),
    statusText: getStatusText(appointment.status),
    statusColor: colors.primary, // Puedes agregar lógica para colores por estado
    isPast: new Date(appointment.appointmentDate) < new Date(),
    isToday: formatDate(appointment.appointmentDate) === formatDate(new Date().toISOString()),
    isUpcoming: new Date(appointment.appointmentDate) > new Date(),
  });

  // Componente simple para mostrar appointment
  const SimpleAppointmentItem = ({ item }: { item: ClientAppointmentDto }) => (
    <TouchableOpacity
      style={[styles.appointmentItem, { backgroundColor: colors.surface }]}
      onPress={() => handleAppointmentPress(item)}
    >
      <View style={styles.appointmentHeader}>
        <Text style={[styles.appointmentDate, { color: colors.text }]}>
          {formatDate(item.appointmentDate)}
        </Text>
        <Text style={[styles.appointmentTime, { color: colors.primary }]}>
          {formatTime(item.appointmentTime)}
        </Text>
      </View>
      
      <Text style={[styles.appointmentServiceName, { color: colors.text }]}>
        {item.serviceType.name}
      </Text>
      
      <View style={styles.appointmentFooter}>
        <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.statusText, { color: colors.primary }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
        <Text style={[styles.appointmentDuration, { color: colors.textSecondary }]}>
          {item.duration} min
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Renderizar item de la lista
  const renderAppointmentItem = ({ item, index }: { item: ClientAppointmentDto; index: number }) => (
    <SimpleAppointmentItem item={item} />
  );

  // Renderizar separador entre items
  const renderSeparator = () => <View style={{ height: 4 }} />;

  // Renderizar loading al final de la lista
  const renderFooter = () => {
    if (!hasMore || compact) return null;
    
    return loading ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Cargando más citas...
        </Text>
      </View>
    ) : null;
  };

  // Renderizar estado vacío
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No tienes citas registradas
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Cuando tengas citas programadas aparecerán aquí
      </Text>
    </View>
  );

  // Renderizar error
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={[styles.errorTitle, { color: colors.error }]}>
        Error al cargar las citas
      </Text>
      <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
        {error || 'Ocurrió un error inesperado'}
      </Text>
    </View>
  );

  // Vista compacta para usar en otras pantallas (ej: perfil)
  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.compactHeader}>
          <Text style={[styles.compactTitle, { color: colors.text }]}>
            Citas Recientes
          </Text>
          {onSeeAll && (
            <Text 
              style={[styles.seeAllButton, { color: colors.primary }]}
              onPress={onSeeAll}
            >
              Ver todas
            </Text>
          )}
        </View>

        {loading ? (
          <View style={styles.compactLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : displayItems.length > 0 ? (
          <View>
            {displayItems.map((item: ClientAppointmentDto, index: number) => (
              <View key={item.id}>
                <SimpleAppointmentItem item={item} />
                {index < displayItems.length - 1 && <View style={styles.compactDivider} />}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.compactEmpty}>
            <Text style={[styles.compactEmptyText, { color: colors.textSecondary }]}>
              No hay citas recientes
            </Text>
          </View>
        )}
      </View>
    );
  }

  // Vista completa
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Título */}
      {showTitle && (
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Historial de Citas
          </Text>
        </View>
      )}

      {/* Estadísticas - Versión simplificada inline */}
      <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.statsGrid}>
          <View style={[styles.statItem, { borderColor: '#e1e5e9' }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{summary.totalAppointments}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          <View style={[styles.statItem, { borderColor: '#e1e5e9' }]}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{summary.completedAppointments}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completadas</Text>
          </View>
          <View style={[styles.statItem, { borderColor: '#e1e5e9' }]}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>{summary.pendingAppointments}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pendientes</Text>
          </View>
          <View style={[styles.statItem, { borderColor: '#e1e5e9' }]}>
            <Text style={[styles.statNumber, { color: colors.error }]}>{summary.cancelledAppointments}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Canceladas</Text>
          </View>
        </View>
      </View>

      {/* Filtros - Versión simplificada */}
      <View style={styles.filtersContainer}>
        <Text style={[styles.filtersTitle, { color: colors.text }]}>Filtros</Text>
        <View style={styles.filtersRow}>
          <TouchableOpacity 
            style={[styles.filterButton, { backgroundColor: !filters.status ? colors.primary : colors.surface }]}
            onPress={() => updateFilters({ status: undefined })}
          >
            <Text style={[styles.filterButtonText, { color: !filters.status ? 'white' : colors.text }]}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, { backgroundColor: filters.status === 'PENDING' ? colors.primary : colors.surface }]}
            onPress={() => updateFilters({ status: 'PENDING' })}
          >
            <Text style={[styles.filterButtonText, { color: filters.status === 'PENDING' ? 'white' : colors.text }]}>
              Pendientes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, { backgroundColor: filters.status === 'COMPLETED' ? colors.primary : colors.surface }]}
            onPress={() => updateFilters({ status: 'COMPLETED' })}
          >
            <Text style={[styles.filterButtonText, { color: filters.status === 'COMPLETED' ? 'white' : colors.text }]}>
              Completadas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de citas */}
      {error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={displayItems}
          renderItem={renderAppointmentItem}
          keyExtractor={(item) => `appointment-${item.id}`}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={!loading ? renderEmptyState : null}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshAppointments}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Loading inicial */}
      {loading && appointments.length === 0 && (
        <View style={styles.initialLoading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando tus citas...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statsContainer: {
    marginHorizontal: 0,
  },
  listContainer: {
    paddingVertical: 8,
    flexGrow: 1,
  },

  // Estados vacío y error
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Loading states
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
  },
  initialLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },

  // Compact view styles
  compactContainer: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  compactTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  compactLoading: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  compactDivider: {
    height: 1,
    backgroundColor: '#f0f2f5',
    marginHorizontal: 16,
  },
  compactEmpty: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  compactEmptyText: {
    fontSize: 14,
  },

  // Nuevos estilos para estadísticas
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },

  // Estilos para filtros
  filtersContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Estilos para appointment items
  appointmentItem: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  appointmentServiceName: {
    fontSize: 16,
    marginBottom: 12,
  },
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentDuration: {
    fontSize: 12,
  },
});