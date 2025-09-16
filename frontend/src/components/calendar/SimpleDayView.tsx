// src/components/calendar/SimpleDayView.tsx
// Vista diaria simplificada y robusta
import React from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  StyleSheet, 
  RefreshControl,
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useCalendar } from '@/contexts/CalendarContext';

interface SimpleDayViewProps {
  onSlotPress?: (time: string) => void;
  onAppointmentPress?: (appointment: any) => void;
}

const SimpleDayView: React.FC<SimpleDayViewProps> = ({
  onSlotPress,
  onAppointmentPress
}) => {
  const { colors } = useTheme();
  const { state, actions } = useCalendar();

  const generateTimeSlots = () => {
    if (!state.dayData?.businessHours) return [];
    
    const { start, end, isClosed } = state.dayData.businessHours;
    if (isClosed) return [];

    const slots = [];
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);

    // Obtener las citas del día
    const dayAppointments = state.dayData.appointments || [];

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Buscar si hay una cita en este horario
        const appointment = dayAppointments.find((apt: any) => {
          const aptStartTime = new Date(apt.startTime);
          const aptHour = aptStartTime.getUTCHours();
          const aptMinute = aptStartTime.getUTCMinutes();
          const aptTimeStr = `${aptHour.toString().padStart(2, '0')}:${aptMinute.toString().padStart(2, '0')}`;
          
          return aptTimeStr === timeStr;
        });

        slots.push({
          time: timeStr,
          isAvailable: !appointment,
          appointment: appointment || null
        });
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleRefresh = async () => {
    await actions.refreshCurrentView();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flex: 1,
    },
    timeSlot: {
      flexDirection: 'row',
      minHeight: 60,
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
    slotContent: {
      flex: 1,
      padding: 8,
      justifyContent: 'center',
      marginLeft: 1,
    },
    availableSlot: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.textSecondary + '20',
      borderStyle: 'dashed',
      borderRadius: 4,
    },
    occupiedSlot: {
      backgroundColor: colors.primary + '20',
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
      borderRadius: 4,
    },
    availableText: {
      fontSize: 11,
      color: colors.textSecondary + '60',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    appointmentText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    reservedText: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    },
    closedContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    closedText: {
      color: colors.textSecondary,
      fontSize: 18,
      fontWeight: '500',
      textAlign: 'center',
      marginTop: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 16,
      textAlign: 'center',
    },
  });

  if (state.loading.day) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Cargando...</Text>
      </View>
    );
  }

  if (state.dayData?.businessHours?.isClosed) {
    return (
      <View style={styles.closedContainer}>
        <Ionicons 
          name="lock-closed" 
          size={48} 
          color={colors.textSecondary + '40'} 
        />
        <Text style={styles.closedText}>
          Cerrado este día
        </Text>
      </View>
    );
  }

  if (!timeSlots.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons 
          name="calendar-outline" 
          size={48} 
          color={colors.textSecondary + '40'} 
        />
        <Text style={styles.emptyText}>
          No hay horarios disponibles
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      refreshControl={
        <RefreshControl
          refreshing={state.loading.day}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {timeSlots.map((slot) => (
        <TouchableOpacity
          key={slot.time}
          style={styles.timeSlot}
          onPress={() => {
            if (slot.appointment && onAppointmentPress) {
              onAppointmentPress(slot.appointment);
            } else if (slot.isAvailable && onSlotPress) {
              onSlotPress(slot.time);
            }
          }}
          disabled={!slot.isAvailable && !slot.appointment}
        >
          <View style={styles.timeColumn}>
            <Text style={styles.timeText}>{slot.time}</Text>
          </View>
          
          <View style={[
            styles.slotContent,
            slot.isAvailable ? styles.availableSlot : styles.occupiedSlot
          ]}>
            {slot.appointment ? (
              <>
                <Text style={styles.appointmentText}>Reservado</Text>
                <Text style={styles.reservedText}>Cita programada</Text>
              </>
            ) : (
              <Text style={styles.availableText}>Disponible</Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default SimpleDayView;