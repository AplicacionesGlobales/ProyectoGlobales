// src/components/calendar/base/CalendarTimeSlot.tsx  
// Principio de Responsabilidad Única (SRP)
// Componente que solo renderiza un slot de tiempo individual

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
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
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

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
    if (!appointment) return tintColor;
    
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
        return tintColor;
    }
  };

  const styles = StyleSheet.create({
    container: {
      height,
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: textColor + '10',
    },
    timeColumn: {
      width: 60,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: backgroundColor,
    },
    timeText: {
      fontSize: 12,
      color: textColor + 'AA',
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
      backgroundColor: backgroundColor,
      borderWidth: 1,
      borderColor: textColor + '20',
      borderStyle: 'dashed',
    },
    unavailable: {
      backgroundColor: textColor + '05',
    },
    occupied: {
      backgroundColor: getAppointmentColor() + '20',
      borderLeftWidth: 4,
      borderLeftColor: getAppointmentColor(),
    },
    currentTime: {
      backgroundColor: tintColor + '10',
      borderLeftWidth: 3,
      borderLeftColor: tintColor,
    },
    disabled: {
      backgroundColor: textColor + '05',
      opacity: 0.5,
    },
    appointmentContent: {
      flex: 1,
    },
    appointmentTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: textColor,
    },
    appointmentSubtitle: {
      fontSize: 10,
      color: textColor + 'AA',
      marginTop: 2,
    },
    availableText: {
      fontSize: 11,
      color: textColor + '60',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    pressableStyle: {
      borderRadius: 4,
    },
  });

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
        android_ripple={{ color: tintColor + '20' }}
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
