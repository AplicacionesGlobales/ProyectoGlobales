// src/components/calendar/DailyCalendarView.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert,
  Pressable
} from 'react-native';
import { format, parseISO, addDays, subDays, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useDailyCalendar } from '@/hooks/useDailyCalendar';

const { height: screenHeight } = Dimensions.get('window');
const HOUR_HEIGHT = 60; // Height of each hour block
const TIMELINE_WIDTH = 60; // Width of time labels column
const CURRENT_TIME_INDICATOR_HEIGHT = 2;

export interface DailyCalendarViewProps {
  brandId: number;
  initialDate?: string; // YYYY-MM-DD format
  onSlotPress?: (timeSlot: string, date: string) => void;
  onAppointmentPress?: (appointmentId: number) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showMiniCalendar?: boolean;
}

export const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({
  brandId,
  initialDate = new Date().toISOString().split('T')[0],
  onSlotPress,
  onAppointmentPress,
  autoRefresh = true,
  refreshInterval = 30000,
  showMiniCalendar = false
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const currentTimeIndicatorRef = useRef<View>(null);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  // Use available colors or fallbacks
  const cardBackground = backgroundColor;
  const borderColor = textColor + '20'; // 20% opacity

  // Daily calendar hook
  const {
    appointments,
    businessHours,
    agenda,
    totalAppointments,
    totalAvailableSlots,
    loading,
    error,
    refreshing,
    refreshData,
    navigateToPreviousDay,
    navigateToNextDay,
    navigateToToday,
    getTimeSlots,
    getCurrentTimeSlot,
    isSlotAvailable,
    getAppointmentAtTime,
    isCurrentTimeInBusinessHours
  } = useDailyCalendar({
    brandId,
    date: selectedDate,
    autoRefresh,
    refreshInterval
  });

  // Generate time slots for the timeline
  const timeSlots = useMemo(() => {
    if (businessHours.isClosed) return [];
    return getTimeSlots();
  }, [businessHours, getTimeSlots]);

  // Get current time position for indicator
  const currentTimePosition = useMemo(() => {
    if (!isToday(parseISO(selectedDate)) || businessHours.isClosed) return null;
    
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    const [startHour] = businessHours.start.split(':').map(Number);
    const [endHour] = businessHours.end.split(':').map(Number);
    
    if (currentHour < startHour || currentHour >= endHour) return null;
    
    const relativeHour = currentHour - startHour;
    const relativeMinutes = currentMinute;
    
    return (relativeHour * HOUR_HEIGHT) + (relativeMinutes * HOUR_HEIGHT / 60);
  }, [selectedDate, businessHours]);

  // Auto-scroll to current time on mount and date change
  useEffect(() => {
    if (currentTimePosition !== null && scrollViewRef.current) {
      const scrollPosition = Math.max(0, currentTimePosition - (screenHeight / 3));
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: scrollPosition,
          animated: true
        });
      }, 100);
    }
  }, [currentTimePosition, selectedDate]);

  // Handle date navigation
  const handlePreviousDay = () => {
    const previousDay = format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd');
    setSelectedDate(previousDay);
    navigateToPreviousDay();
  };

  const handleNextDay = () => {
    const nextDay = format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd');
    setSelectedDate(nextDay);
    navigateToNextDay();
  };

  const handleTodayPress = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    navigateToToday();
  };

  // Handle slot press
  const handleSlotPress = (timeSlot: string) => {
    if (isSlotAvailable(timeSlot)) {
      onSlotPress?.(timeSlot, selectedDate);
    } else {
      const appointment = getAppointmentAtTime(timeSlot);
      if (appointment) {
        onAppointmentPress?.(appointment.id);
      }
    }
  };

  // Render appointment block
  const renderAppointmentBlock = (appointment: any, startTime: string, duration: number) => {
    const height = (duration / 60) * HOUR_HEIGHT;
    
    const getStatusColor = (status: string) => {
      switch (status?.toUpperCase()) {
        case 'CONFIRMED': return '#4CAF50';
        case 'PENDING': return '#FF9800';
        case 'CANCELLED': return '#F44336';
        case 'IN_PROGRESS': return '#2196F3';
        case 'COMPLETED': return '#9C27B0';
        default: return tintColor;
      }
    };

    const statusColor = appointment.serviceType?.color || getStatusColor(appointment.status);

    return (
      <Pressable
        key={appointment.id}
        style={[
          styles.appointmentBlock,
          {
            height,
            backgroundColor: statusColor + '20',
            borderLeftColor: statusColor,
            borderColor: statusColor + '40',
          }
        ]}
        onPress={() => onAppointmentPress?.(appointment.id)}
      >
        <View style={styles.appointmentContent}>
          <ThemedText style={[styles.appointmentTime, { color: statusColor }]}>
            {startTime} - {appointment.endTime?.substring(0, 5)}
          </ThemedText>
          
          {appointment.client && (
            <ThemedText style={styles.appointmentClient} numberOfLines={1}>
              {appointment.client.firstName} {appointment.client.lastName}
            </ThemedText>
          )}
          
          {appointment.serviceType && (
            <ThemedText style={styles.appointmentService} numberOfLines={1}>
              {appointment.serviceType.name}
            </ThemedText>
          )}
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {appointment.status}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  // Render available slot
  const renderAvailableSlot = (timeSlot: string, duration: number) => {
    const height = (duration / 60) * HOUR_HEIGHT;
    
    return (
      <Pressable
        key={`available-${timeSlot}`}
        style={[
          styles.availableSlot,
          {
            height,
            backgroundColor: tintColor + '10',
            borderColor: tintColor + '30',
          }
        ]}
        onPress={() => handleSlotPress(timeSlot)}
      >
        <View style={styles.availableSlotContent}>
          <Ionicons 
            name="add-circle-outline" 
            size={20} 
            color={tintColor + '80'} 
          />
          <ThemedText style={[styles.availableText, { color: tintColor + '80' }]}>
            Disponible
          </ThemedText>
          <ThemedText style={[styles.slotDuration, { color: tintColor + '60' }]}>
            {duration} min
          </ThemedText>
        </View>
      </Pressable>
    );
  };

  // Render hour timeline
  const renderTimeline = () => {
    if (businessHours.isClosed) {
      return (
        <ThemedView style={styles.closedContainer}>
          <Ionicons name="lock-closed" size={48} color={textColor + '40'} />
          <ThemedText style={styles.closedText}>
            Cerrado
          </ThemedText>
          <ThemedText style={styles.closedSubtext}>
            El negocio está cerrado este día
          </ThemedText>
        </ThemedView>
      );
    }

    const [startHour] = businessHours.start.split(':').map(Number);
    const [endHour] = businessHours.end.split(':').map(Number);
    
    const hours = [];
    for (let hour = startHour; hour < endHour; hour++) {
      hours.push(hour);
    }

    return (
      <View style={styles.timelineContainer}>
        {hours.map((hour, index) => (
          <View key={hour} style={[styles.hourBlock, { height: HOUR_HEIGHT }]}>
            {/* Time label */}
            <View style={[styles.timeLabel, { width: TIMELINE_WIDTH }]}>
              <ThemedText style={styles.timeText}>
                {hour.toString().padStart(2, '0')}:00
              </ThemedText>
            </View>
            
            {/* Hour content area */}
            <View style={[styles.hourContent, { borderBottomColor: borderColor }]}>
              {/* Render agenda slots for this hour */}
              {agenda
                .filter(slot => {
                  const slotHour = parseInt(slot.startTime.split(':')[0]);
                  return slotHour === hour;
                })
                .map(slot => {
                  if (slot.type === 'appointment' && slot.appointment) {
                    return renderAppointmentBlock(
                      slot.appointment,
                      slot.startTime,
                      slot.duration
                    );
                  } else if (slot.type === 'available' && slot.isBookable) {
                    return renderAvailableSlot(slot.startTime, slot.duration);
                  }
                  return null;
                })
              }
            </View>
          </View>
        ))}
        
        {/* Current time indicator */}
        {currentTimePosition !== null && (
          <View
            ref={currentTimeIndicatorRef}
            style={[
              styles.currentTimeIndicator,
              {
                top: currentTimePosition,
                backgroundColor: '#FF5722',
                left: TIMELINE_WIDTH - 10,
              }
            ]}
          >
            <View style={[styles.currentTimeDot, { backgroundColor: '#FF5722' }]} />
            <View style={[styles.currentTimeLine, { backgroundColor: '#FF5722' }]} />
          </View>
        )}
      </View>
    );
  };

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#F44336" />
          <ThemedText style={styles.errorText}>
            {error}
          </ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
            <ThemedText style={styles.retryText}>
              Reintentar
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: cardBackground, borderBottomColor: borderColor }]}>
        {/* Date Navigation */}
        <View style={styles.dateNavigation}>
          <TouchableOpacity
            style={[styles.navButton, { borderColor }]}
            onPress={handlePreviousDay}
          >
            <Ionicons name="chevron-back" size={20} color={textColor} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.dateContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <ThemedText style={styles.dateText}>
              {format(parseISO(selectedDate), 'EEEE, d MMMM yyyy', { locale: es })}
            </ThemedText>
            <Ionicons name="calendar" size={16} color={tintColor} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navButton, { borderColor }]}
            onPress={handleNextDay}
          >
            <Ionicons name="chevron-forward" size={20} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Today Button */}
        {!isToday(parseISO(selectedDate)) && (
          <TouchableOpacity
            style={[styles.todayButton, { backgroundColor: tintColor }]}
            onPress={handleTodayPress}
          >
            <ThemedText style={[styles.todayText, { color: 'white' }]}>
              Hoy
            </ThemedText>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>
              {totalAppointments}
            </ThemedText>
            <ThemedText style={styles.statLabel}>
              Citas
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>
              {totalAvailableSlots}
            </ThemedText>
            <ThemedText style={styles.statLabel}>
              Disponibles
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Calendar Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            tintColor={tintColor}
            title="Actualizando..."
          />
        }
      >
        {renderTimeline()}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
    textTransform: 'capitalize',
  },
  todayButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  todayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  scrollContainer: {
    flex: 1,
  },
  timelineContainer: {
    position: 'relative',
    paddingBottom: 100,
  },
  hourBlock: {
    flexDirection: 'row',
  },
  timeLabel: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    paddingHorizontal: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
  },
  hourContent: {
    flex: 1,
    borderBottomWidth: 0.5,
    position: 'relative',
    paddingHorizontal: 8,
  },
  appointmentBlock: {
    position: 'absolute',
    left: 8,
    right: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderWidth: 1,
    padding: 8,
    zIndex: 2,
  },
  appointmentContent: {
    flex: 1,
  },
  appointmentTime: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  appointmentClient: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  appointmentService: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  availableSlot: {
    position: 'absolute',
    left: 8,
    right: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  availableSlotContent: {
    alignItems: 'center',
  },
  availableText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  slotDuration: {
    fontSize: 10,
    marginTop: 2,
  },
  currentTimeIndicator: {
    position: 'absolute',
    right: 0,
    height: CURRENT_TIME_INDICATOR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  currentTimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  currentTimeLine: {
    flex: 1,
    height: CURRENT_TIME_INDICATOR_HEIGHT,
  },
  closedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  closedText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    opacity: 0.7,
  },
  closedSubtext: {
    fontSize: 16,
    marginTop: 8,
    opacity: 0.5,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    opacity: 0.7,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
});
