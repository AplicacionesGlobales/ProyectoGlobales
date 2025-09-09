// src/components/calendar/base/CalendarTimeSlot.tsx  
// Componente TimeSlot con colores unificados del tema

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { CalendarAppointment } from '@/types/calendar';

interface CalendarTimeSlotProps {
  time: string;
  isAvailable: boolean;
  appointment?: CalendarAppointment | null;
  onPress?: () => void;
  onLongPress?: () => void;
  height?: number;
  showTime?: boolean;
  timeFormat?: '12h' | '24h';
  isCurrentTime?: boolean;
  disabled?: boolean;
}

const CalendarTimeSlot: React.FC<CalendarTimeSlotProps> = ({
  time,
  isAvailable,
  appointment,
  onPress,
  onLongPress,
  height = 60,
  showTime = true,
  timeFormat = '24h',
  isCurrentTime = false,
  disabled = false
}) => {
  const { colors } = useTheme();

  const formatDisplayTime = (timeStr: string): string => {
    if (timeFormat === '12h') {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
    return timeStr;
  };

  const getSlotStyle = () => {
    if (disabled) return styles.disabled;
    if (appointment) return styles.occupied;
    if (isCurrentTime) return styles.currentTime;
    if (isAvailable) return styles.available;
    return styles.unavailable;
  };

  const getAppointmentColor = () => {
    if (!appointment) return colors.primary;
    
    switch (appointment.status) {
      case 'CONFIRMED':
        return '#10B981'; // green
      case 'PENDING':
        return '#F59E0B'; // amber
      case 'COMPLETED':
        return '#6B7280'; // gray
      case 'CANCELLED':
        return '#EF4444'; // red
      default:
        return colors.primary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      height,
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.textSecondary + '10',
    },
    timeColumn: {
      width: 60,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    timeText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    slotContainer: {
      flex: 1,
      marginLeft: 1,
      borderRadius: 4,
      padding: 4,
      justifyContent: 'center',
    },
    available: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.textSecondary + '20',
      borderStyle: 'dashed',
    },
    unavailable: {
      backgroundColor: colors.textSecondary + '05',
    },
    occupied: {
      backgroundColor: getAppointmentColor() + '20',
      borderLeftWidth: 4,
      borderLeftColor: getAppointmentColor(),
      borderRadius: 8,
    },
    currentTime: {
      backgroundColor: colors.primary + '10',
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      borderRadius: 8,
    },
    disabled: {
      backgroundColor: colors.textSecondary + '05',
      opacity: 0.5,
    },
    appointmentContent: {
      flex: 1,
    },
    appointmentTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    appointmentSubtitle: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    },
    appointmentStatus: {
      fontSize: 9,
      fontWeight: '500',
      marginTop: 2,
      textTransform: 'uppercase',
    },
    statusConfirmed: {
      color: '#10B981',
    },
    statusPending: {
      color: '#F59E0B',
    },
    statusCompleted: {
      color: '#6B7280',
    },
    statusCancelled: {
      color: '#EF4444',
    },
    availableText: {
      fontSize: 11,
      color: colors.textSecondary + '60',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    pressableStyle: {
      borderRadius: 4,
    },
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return styles.statusConfirmed;
      case 'PENDING': return styles.statusPending;
      case 'COMPLETED': return styles.statusCompleted;
      case 'CANCELLED': return styles.statusCancelled;
      default: return styles.statusPending;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmada';
      case 'PENDING': return 'Pendiente';
      case 'COMPLETED': return 'Completada';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  const handleLongPress = () => {
    if (!disabled && onLongPress) {
      onLongPress();
    }
  };

  return (
    <View style={styles.container}>
      {/* Time Column */}
      {showTime && (
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>
            {formatDisplayTime(time)}
          </Text>
        </View>
      )}

      {/* Slot Content */}
      <Pressable
        style={[styles.slotContainer, getSlotStyle()]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={disabled}
        android_ripple={{ color: colors.primary + '20' }}
      >
        {appointment ? (
          <View style={styles.appointmentContent}>
            <Text style={styles.appointmentTitle} numberOfLines={1}>
              {appointment.client?.firstName} {appointment.client?.lastName}
            </Text>
            {appointment.serviceType && (
              <Text style={styles.appointmentSubtitle} numberOfLines={1}>
                {appointment.serviceType.name}
              </Text>
            )}
            <Text style={[styles.appointmentStatus, getStatusStyle(appointment.status)]}>
              {getStatusText(appointment.status)}
            </Text>
          </View>
        ) : isAvailable ? (
          <Text style={styles.availableText}>
            Disponible
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
};

export default memo(CalendarTimeSlot);