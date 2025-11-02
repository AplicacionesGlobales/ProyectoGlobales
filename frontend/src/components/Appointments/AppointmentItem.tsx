// components/Appointments/AppointmentItem.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { AppointmentDisplayData } from '../../types/appointments.types';

interface AppointmentItemProps {
  appointment: AppointmentDisplayData;
  onPress?: (appointment: AppointmentDisplayData) => void;
  showDetails?: boolean;
}

export const AppointmentItem: React.FC<AppointmentItemProps> = ({
  appointment,
  onPress,
  showDetails = false,
}) => {
  const { colors } = useTheme();

  // Obtener icono según el estado
  const getStatusIcon = (): string => {
    switch (appointment.status.toUpperCase()) {
      case 'COMPLETED':
        return 'checkmark-circle';
      case 'CONFIRMED':
        return 'calendar';
      case 'PENDING':
        return 'time';
      case 'CANCELLED':
        return 'close-circle';
      case 'NO_SHOW':
        return 'person-remove';
      case 'IN_PROGRESS':
        return 'hourglass';
      default:
        return 'calendar-outline';
    }
  };

  // Obtener duración formateada
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Formatear fecha para mostrar relativa
  const getRelativeDate = (): string => {
    if (appointment.isToday) return 'Hoy';
    if (appointment.displayDate === 'Ayer') return 'Ayer';
    if (appointment.displayDate === 'Mañana') return 'Mañana';
    return appointment.displayDate;
  };

  // Obtener texto descriptivo según el estado y tiempo
  const getDescriptiveText = (): string => {
    if (appointment.isToday && appointment.status === 'CONFIRMED') {
      return 'Cita programada para hoy';
    }
    if (appointment.isUpcoming && appointment.status === 'CONFIRMED') {
      return 'Próxima cita confirmada';
    }
    if (appointment.isPast && appointment.status === 'COMPLETED') {
      return 'Cita completada';
    }
    if (appointment.status === 'CANCELLED') {
      return 'Cita cancelada';
    }
    if (appointment.status === 'PENDING') {
      return 'Esperando confirmación';
    }
    return 'Cita programada';
  };

  const handlePress = () => {
    if (onPress) {
      onPress(appointment);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Header con estado e icono */}
      <View style={styles.header}>
        <View style={[styles.statusIconContainer, { backgroundColor: appointment.statusColor + '20' }]}>
          <Ionicons 
            name={getStatusIcon() as any} 
            size={20} 
            color={appointment.statusColor} 
          />
        </View>
        
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>
              {getDescriptiveText()}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: appointment.statusColor }]}>
              <Text style={styles.statusText}>
                {appointment.statusText}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {getRelativeDate()} • {appointment.displayTime}
          </Text>
        </View>
      </View>

      {/* Información de la cita */}
      <View style={styles.appointmentInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Duración: {formatDuration(appointment.duration)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            ID: #{appointment.id}
          </Text>
        </View>
      </View>

      {/* Notas si existen */}
      {appointment.notes && (
        <View style={[styles.notesContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.notesText, { color: colors.textSecondary }]} numberOfLines={2}>
            {appointment.notes}
          </Text>
        </View>
      )}

      {/* Detalles expandidos (si se solicita) */}
      {showDetails && (
        <View style={[styles.detailsContainer, { borderTopColor: colors.textSecondary + '30' }]}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Creado:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {new Date(appointment.createdAt).toLocaleDateString('es-MX')}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Actualizado:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {new Date(appointment.updatedAt).toLocaleDateString('es-MX')}
            </Text>
          </View>
        </View>
      )}

      {/* Indicador visual para citas importantes */}
      {appointment.isToday && (
        <View style={[styles.todayIndicator, { backgroundColor: colors.primary }]} />
      )}
      
      {appointment.isUpcoming && !appointment.isToday && (
        <View style={[styles.upcomingIndicator, { backgroundColor: '#10B981' }]} />
      )}

      {/* Icono de navegación si es presionable */}
      {onPress && (
        <View style={styles.chevronContainer}>
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={colors.textSecondary} 
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  appointmentInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  detailsContainer: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
  },
  todayIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  upcomingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  chevronContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
});