// src/components/calendar/WeeklyCalendarView.tsx
// Vista semanal del calendario optimizada para móviles

import React, { useRef, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useOptimizedWeeklyCalendar } from '@/hooks/useOptimizedWeeklyCalendar';
import CalendarTimeSlot from './base/CalendarTimeSlot';
import type { CalendarConfiguration, CalendarInteractions } from '@/types/calendar';

const { width: screenWidth } = Dimensions.get('window');

interface WeeklyCalendarViewProps {
  brandId: number;
  initialDate?: string;
  config?: Partial<CalendarConfiguration>;
  interactions?: CalendarInteractions;
  showHeader?: boolean;
  showCurrentTimeIndicator?: boolean;
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  brandId,
  initialDate,
  config,
  interactions,
  showHeader = true,
  showCurrentTimeIndicator = true
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const { colors } = useTheme();

  const {
    currentWeekStart,
    weekData,
    weekDays,
    timeSlots,
    loading,
    error,
    isRefreshing,
    navigateToPreviousWeek,
    navigateToNextWeek,
    navigateToCurrentWeek,
    refreshData,
    getDayAppointments,
    isTimeSlotAvailable,
    getAppointmentAtDateTime,
    formatWeekRange,
    getVisibleDays,
    getMobileViewConfig
  } = useOptimizedWeeklyCalendar({
    brandId,
    initialDate,
    config
  });

  const mobileConfig = getMobileViewConfig();
  const visibleDays = getVisibleDays();

  // Auto-scroll to current time on mount
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const scrollPosition = Math.max(0, (currentHour - 8) * 60); // 8am como referencia
    
    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: scrollPosition,
        animated: true
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  // Handlers
  const handleSlotPress = (date: string, time: string) => {
    if (interactions?.onSlotPress) {
      interactions.onSlotPress(date, time);
    } else {
      Alert.alert(
        'Nuevo Agendamiento',
        `¿Desea agendar una cita para el ${formatDate(date)} a las ${time}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Agendar', onPress: () => console.log('Agendar:', date, time) }
        ]
      );
    }
  };

  const handleAppointmentPress = (date: string, time: string) => {
    const appointment = getAppointmentAtDateTime(date, time);
    if (appointment && interactions?.onAppointmentPress) {
      interactions.onAppointmentPress(appointment);
    }
  };

  const formatDate = (date: string): string => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatDateHeader = (date: string): string => {
    const dateObj = new Date(date);
    const today = new Date().toISOString().split('T')[0];
    const isToday = date === today;
    
    return isToday ? 'Hoy' : dateObj.toLocaleDateString('es-ES', {
      weekday: 'short'
    });
  };

  const isToday = (date: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  // Current time indicator position
  const getCurrentTimePosition = (): number | null => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Assuming first time slot starts at 8:00 AM
    const firstSlotTime = 8 * 60;
    if (currentTime < firstSlotTime) return null;
    
    const relativeMinutes = currentTime - firstSlotTime;
    return relativeMinutes; // 1px per minute
  };

  const currentTimePosition = getCurrentTimePosition();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.textSecondary + '20',
      backgroundColor: colors.surface,
    },
    weekRange: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    navButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.textSecondary + '15',
    },
    weekHeaderContainer: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.textSecondary + '20',
    },
    weekHeader: {
      flexDirection: 'row',
      paddingVertical: 8,
    },
    timeColumnHeader: {
      width: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayHeader: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
    },
    dayHeaderToday: {
      backgroundColor: colors.primary + '20',
      borderRadius: 8,
      marginHorizontal: 2,
    },
    dayHeaderText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
    dayHeaderTextToday: {
      color: colors.primary,
    },
    dayNumber: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 2,
    },
    dayNumberToday: {
      color: colors.primary,
    },
    scrollContainer: {
      flex: 1,
    },
    timelineContainer: {
      position: 'relative',
      flexDirection: 'row',
    },
    timeColumn: {
      width: 60,
      backgroundColor: colors.surface,
      borderRightWidth: 1,
      borderRightColor: colors.textSecondary + '20',
    },
    daysContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    dayColumn: {
      flex: 1,
      borderRightWidth: 1,
      borderRightColor: colors.textSecondary + '10',
    },
    timeSlotRow: {
      flexDirection: 'row',
      height: 60,
      borderBottomWidth: 1,
      borderBottomColor: colors.textSecondary + '10',
    },
    timeSlotCell: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 4,
    },
    currentTimeIndicator: {
      position: 'absolute',
      left: 60,
      right: 0,
      height: 2,
      backgroundColor: colors.primary,
      zIndex: 10,
    },
    currentTimeDot: {
      position: 'absolute',
      left: -4,
      top: -3,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      color: colors.textSecondary,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: colors.surface,
      fontSize: 16,
      fontWeight: '500',
    },
  });

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        {showHeader && (
          <View style={styles.header}>
            <TouchableOpacity style={styles.navButton} onPress={navigateToPreviousWeek}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <Text style={styles.weekRange}>
              {formatWeekRange()}
            </Text>

            <TouchableOpacity style={styles.navButton} onPress={navigateToNextWeek}>
              <Ionicons name="chevron-forward" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error al cargar el calendario: {error.message}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {showHeader && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.navButton} onPress={navigateToPreviousWeek}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={navigateToCurrentWeek}>
            <Text style={styles.weekRange}>
              {formatWeekRange()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={navigateToNextWeek}>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* Week Header */}
      <View style={styles.weekHeaderContainer}>
        <View style={styles.weekHeader}>
          <View style={styles.timeColumnHeader} />
          {visibleDays.slice(0, mobileConfig.daysToShow).map((day) => (
            <View 
              key={day.date}
              style={[
                styles.dayHeader,
                isToday(day.date) && styles.dayHeaderToday
              ]}
            >
              <Text style={[
                styles.dayHeaderText,
                isToday(day.date) && styles.dayHeaderTextToday
              ]}>
                {formatDateHeader(day.date)}
              </Text>
              <Text style={[
                styles.dayNumber,
                isToday(day.date) && styles.dayNumberToday
              ]}>
                {new Date(day.date).getDate()}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Timeline */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timelineContainer}>
          {/* Current Time Indicator */}
          {showCurrentTimeIndicator && currentTimePosition !== null && (
            <View 
              style={[
                styles.currentTimeIndicator, 
                { top: currentTimePosition }
              ]}
            >
              <View style={styles.currentTimeDot} />
            </View>
          )}

          {/* Time Column */}
          <View style={styles.timeColumn}>
            {timeSlots.map((timeSlot, index) => (
              <View key={timeSlot} style={styles.timeSlotRow}>
                <CalendarTimeSlot
                  time={timeSlot}
                  isAvailable={false}
                  showTime={true}
                  timeFormat={config?.timeFormat || '24h'}
                  height={60}
                  disabled={true}
                />
              </View>
            ))}
          </View>

          {/* Days Columns */}
          <View style={styles.daysContainer}>
            {visibleDays.slice(0, mobileConfig.daysToShow).map((day) => (
              <View key={day.date} style={styles.dayColumn}>
                {timeSlots.map((timeSlot) => {
                  const isAvailable = isTimeSlotAvailable(day.date, timeSlot);
                  const appointment = getAppointmentAtDateTime(day.date, timeSlot);
                  
                  return (
                    <View key={`${day.date}-${timeSlot}`} style={styles.timeSlotRow}>
                      <CalendarTimeSlot
                        time={timeSlot}
                        isAvailable={isAvailable}
                        appointment={appointment}
                        onPress={() => appointment ? 
                          handleAppointmentPress(day.date, timeSlot) : 
                          handleSlotPress(day.date, timeSlot)
                        }
                        onLongPress={() => handleSlotPress(day.date, timeSlot)}
                        height={60}
                        showTime={false}
                        timeFormat={config?.timeFormat || '24h'}
                        disabled={loading.appointments}
                      />
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default WeeklyCalendarView;