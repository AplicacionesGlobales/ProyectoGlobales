import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

// Date utility functions
const formatDate = (date: Date, format: string = 'yyyy-MM-dd'): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  switch (format) {
    case 'MMM yyyy':
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                     'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${months[date.getMonth()]} ${year}`;
    case 'EEE':
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return days[date.getDay()];
    case 'd':
      return day;
    case 'HH:mm':
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    default:
      return `${year}-${month}-${day}`;
  }
};

const startOfWeek = (date: Date, weekStartsOn: number = 0): Date => {
  const day = date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  const result = new Date(date);
  result.setDate(date.getDate() - diff);
  return result;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(date.getDate() + days);
  return result;
};

const addWeeks = (date: Date, weeks: number): Date => {
  return addDays(date, weeks * 7);
};

const subWeeks = (date: Date, weeks: number): Date => {
  return addDays(date, -weeks * 7);
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

// Types
export interface CalendarAppointment {
  id: number;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  client?: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
  serviceType?: {
    name: string;
    duration: number;
  };
  notes?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: CalendarAppointment;
}

export interface WeeklyCalendarProps {
  appointments: CalendarAppointment[];
  businessHours?: {
    start: string; // "09:00"
    end: string;   // "18:00"
  };
  onSlotPress?: (date: Date, time: string) => void;
  onAppointmentPress?: (appointment: CalendarAppointment) => void;
  loading?: boolean;
  showWorkDaysOnly?: boolean; // Vista de 5 días vs 7 días
  slotDuration?: number; // en minutos, default 30
}

const WeeklyCalendarView: React.FC<WeeklyCalendarProps> = ({
  appointments,
  businessHours = { start: '09:00', end: '18:00' },
  onSlotPress,
  onAppointmentPress,
  loading = false,
  showWorkDaysOnly = false,
  slotDuration = 30,
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const borderColor = '#E5E7EB'; // Using a static color since 'border' is not available

  // Generate week dates
  const weekDates = useMemo(() => {
    const start = startOfWeek(currentWeek, 0); // Sunday = 0
    const days = showWorkDaysOnly ? 5 : 7;
    const offset = showWorkDaysOnly ? 1 : 0; // Start from Monday if work days only
    
    return Array.from({ length: days }, (_, i) => 
      addDays(start, i + offset)
    );
  }, [currentWeek, showWorkDaysOnly]);

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    const [startHour, startMinute] = businessHours.start.split(':').map(Number);
    const [endHour, endMinute] = businessHours.end.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
    
    return slots;
  }, [businessHours, slotDuration]);

  // Get appointments for a specific date and time
  const getAppointmentForSlot = (date: Date, time: string): CalendarAppointment | undefined => {
    const dateStr = formatDate(date);
    return appointments.find(apt => {
      const aptDate = formatDate(new Date(apt.startTime));
      const aptTime = formatDate(new Date(apt.startTime), 'HH:mm');
      return aptDate === dateStr && aptTime === time;
    });
  };

  // Get status color
  const getStatusColor = (status: CalendarAppointment['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return '#10B981'; // green
      case 'PENDING':
        return '#F59E0B'; // yellow
      case 'COMPLETED':
        return '#6366F1'; // blue
      case 'CANCELLED':
        return '#EF4444'; // red
      default:
        return '#6B7280'; // gray
    }
  };

  // Calculate appointment duration in slots
  const getAppointmentDuration = (appointment: CalendarAppointment): number => {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return Math.ceil(durationMinutes / slotDuration);
  };

  // Navigation functions
  const goToPreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
    setSelectedDate(new Date());
  };

  // Handle slot press
  const handleSlotPress = (date: Date, time: string) => {
    const appointment = getAppointmentForSlot(date, time);
    
    if (appointment && onAppointmentPress) {
      onAppointmentPress(appointment);
    } else if (!appointment && onSlotPress) {
      onSlotPress(date, time);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>Cargando calendario...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerControls}>
          <TouchableOpacity
            onPress={goToPreviousWeek}
            style={[styles.navButton, { backgroundColor: primaryColor + '20' }]}
          >
            <ThemedText style={styles.navButtonText}>◀</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.weekTitle}>
            {formatDate(weekDates[0], 'MMM yyyy')}
          </ThemedText>
          <TouchableOpacity
            onPress={goToNextWeek}
            style={[styles.navButton, { backgroundColor: primaryColor + '20' }]}
          >
            <ThemedText style={styles.navButtonText}>▶</ThemedText>
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={goToToday}
            style={[styles.todayButton, { backgroundColor: primaryColor, borderRadius: 6 }]}
          >
            <ThemedText style={[styles.buttonText, { color: 'white' }]}>Hoy</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {}} // This would be handled by parent component
            style={[styles.viewToggle, { backgroundColor: backgroundColor, borderWidth: 1, borderColor: primaryColor, borderRadius: 6 }]}
          >
            <ThemedText style={[styles.buttonText, { color: primaryColor }]}>
              {showWorkDaysOnly ? "7 días" : "5 días"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Days header */}
      <View style={[styles.daysHeader, { borderBottomColor: borderColor }]}>
        <View style={styles.timeColumn} />
        {weekDates.map((date, index) => (
          <View key={index} style={styles.dayHeader}>
            <ThemedText style={[
              styles.dayName,
              isToday(date) && { color: primaryColor, fontWeight: 'bold' }
            ]}>
              {formatDate(date, 'EEE')}
            </ThemedText>
            <ThemedText style={[
              styles.dayDate,
              isToday(date) && { color: primaryColor, fontWeight: 'bold' }
            ]}>
              {formatDate(date, 'd')}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <ScrollView style={styles.calendarContainer} showsVerticalScrollIndicator={false}>
        {timeSlots.map((time, timeIndex) => (
          <View key={time} style={styles.timeRow}>
            {/* Time label */}
            <View style={styles.timeLabel}>
              <ThemedText style={styles.timeText}>{time}</ThemedText>
            </View>

            {/* Day slots */}
            {weekDates.map((date, dayIndex) => {
              const appointment = getAppointmentForSlot(date, time);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isPast = new Date() > new Date(`${formatDate(date)}T${time}`);
              
              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={[
                    styles.slot,
                    { borderColor },
                    isSelected && { backgroundColor: primaryColor + '20' },
                    isPast && styles.pastSlot,
                    appointment && {
                      backgroundColor: getStatusColor(appointment.status) + '20',
                      borderColor: getStatusColor(appointment.status),
                    }
                  ]}
                  onPress={() => handleSlotPress(date, time)}
                  disabled={isPast && !appointment}
                >
                  {appointment && (
                    <View style={styles.appointmentContent}>
                      <ThemedText style={styles.appointmentClient} numberOfLines={1}>
                        {appointment.client 
                          ? `${appointment.client.firstName || ''} ${appointment.client.lastName || ''}`.trim() || appointment.client.email
                          : 'Cliente'
                        }
                      </ThemedText>
                      {appointment.serviceType && (
                        <ThemedText style={styles.appointmentService} numberOfLines={1}>
                          {appointment.serviceType.name}
                        </ThemedText>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    minWidth: 40,
    height: 40,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  daysHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  timeColumn: {
    width: 60,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayName: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  calendarContainer: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timeLabel: {
    width: 60,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  slot: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    minHeight: 60,
    padding: 4,
    justifyContent: 'center',
  },
  pastSlot: {
    opacity: 0.5,
  },
  appointmentContent: {
    flex: 1,
    justifyContent: 'center',
  },
  appointmentClient: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  appointmentService: {
    fontSize: 10,
    opacity: 0.8,
  },
});

export default WeeklyCalendarView;
