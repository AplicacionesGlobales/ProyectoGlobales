// src/components/calendar/OptimizedDailyCalendarView.tsx
// Principio de Responsabilidad Única (SRP) y Principio Abierto-Cerrado (OCP)
// Vista diaria del calendario optimizada para móviles

import React, { useMemo, useRef, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  StyleSheet, 
  RefreshControl, 
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useOptimizedDailyCalendar } from '@/hooks/useOptimizedDailyCalendar';
import CalendarTimeSlot from './base/CalendarTimeSlot';
import type { CalendarConfiguration, CalendarInteractions } from '@/types/calendar';

const { width: screenWidth } = Dimensions.get('window');

interface OptimizedDailyCalendarViewProps {
  brandId: number;
  initialDate?: string;
  config?: Partial<CalendarConfiguration>;
  interactions?: CalendarInteractions;
  showHeader?: boolean;
  showCurrentTimeIndicator?: boolean;
}

const OptimizedDailyCalendarView: React.FC<OptimizedDailyCalendarViewProps> = ({
  brandId,
  initialDate,
  config,
  interactions,
  showHeader = true,
  showCurrentTimeIndicator = true
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  // Calendar hook
  const {
    currentDate,
    dayData,
    timeSlots,
    loading,
    error,
    isRefreshing,
    navigateToPreviousDay,
    navigateToNextDay,
    navigateToToday,
    refreshData,
    isTimeSlotAvailable,
    getAppointmentAtTime,
    getCurrentTimePosition,
    formatTimeForDisplay,
    getVisibleTimeRange,
    shouldShowTimeSlot
  } = useOptimizedDailyCalendar({
    brandId,
    initialDate,
    config
  });

  // Memoized visible time slots for performance
  const visibleTimeSlots = useMemo(() => {
    return timeSlots.filter(timeSlot => shouldShowTimeSlot(timeSlot));
  }, [timeSlots, shouldShowTimeSlot]);

  // Current time indicator position
  const currentTimePosition = getCurrentTimePosition();

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (currentTimePosition && scrollViewRef.current) {
      const timeout = setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, currentTimePosition - 200), // Show some context above
          animated: true
        });
      }, 500); // Small delay to ensure component is mounted

      return () => clearTimeout(timeout);
    }
  }, [currentTimePosition]);

  // Handlers
  const handleSlotPress = (time: string) => {
    if (interactions?.onSlotPress) {
      interactions.onSlotPress(currentDate, time);
    } else {
      Alert.alert(
        'Nuevo Agendamiento',
        `¿Desea agendar una cita para el ${formatDate(currentDate)} a las ${formatTimeForDisplay(time)}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Agendar', onPress: () => console.log('Agendar:', currentDate, time) }
        ]
      );
    }
  };

  const handleAppointmentPress = (time: string) => {
    const appointment = getAppointmentAtTime(time);
    if (appointment && interactions?.onAppointmentPress) {
      interactions.onAppointmentPress(appointment);
    }
  };

  // Format date for display
  const formatDate = (date: string): string => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric', 
      month: 'long'
    });
  };

  // Check if date is today
  const isToday = (date: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: textColor + '20',
    },
    headerCenter: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 16,
    },
    dateTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: textColor,
      textAlign: 'center',
    },
    todayBadge: {
      backgroundColor: tintColor,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginTop: 4,
    },
    todayText: {
      fontSize: 12,
      color: 'white',
      fontWeight: '500',
    },
    navButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: textColor + '10',
    },
    scrollContainer: {
      flex: 1,
    },
    timelineContainer: {
      position: 'relative',
      paddingHorizontal: 16,
    },
    currentTimeIndicator: {
      position: 'absolute',
      left: 76, // After time column
      right: 16,
      height: 2,
      backgroundColor: tintColor,
      zIndex: 10,
      borderRadius: 1,
    },
    currentTimeDot: {
      position: 'absolute',
      left: -4,
      top: -3,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: tintColor,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      color: textColor + 'AA',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: tintColor,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      color: textColor + '60',
      fontSize: 16,
      textAlign: 'center',
    },
    closedContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    closedText: {
      color: textColor + '60',
      fontSize: 18,
      fontWeight: '500',
      textAlign: 'center',
    },
  });

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        {showHeader && (
          <View style={styles.header}>
            <TouchableOpacity style={styles.navButton} onPress={navigateToPreviousDay}>
              <Ionicons name="chevron-back" size={24} color={textColor} />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.dateTitle}>
                {formatDate(currentDate)}
              </Text>
            </View>

            <TouchableOpacity style={styles.navButton} onPress={navigateToNextDay}>
              <Ionicons name="chevron-forward" size={24} color={textColor} />
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

  // Closed day state
  if (dayData?.businessHours?.isClosed) {
    return (
      <View style={styles.container}>
        {showHeader && (
          <View style={styles.header}>
            <TouchableOpacity style={styles.navButton} onPress={navigateToPreviousDay}>
              <Ionicons name="chevron-back" size={24} color={textColor} />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.dateTitle}>
                {formatDate(currentDate)}
              </Text>
            </View>

            <TouchableOpacity style={styles.navButton} onPress={navigateToNextDay}>
              <Ionicons name="chevron-forward" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.closedContainer}>
          <Ionicons name="business" size={48} color={textColor + '40'} />
          <Text style={styles.closedText}>
            Cerrado este día
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {showHeader && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.navButton} onPress={navigateToPreviousDay}>
            <Ionicons name="chevron-back" size={24} color={textColor} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerCenter} onPress={navigateToToday}>
            <Text style={styles.dateTitle}>
              {formatDate(currentDate)}
            </Text>
            {isToday(currentDate) && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayText}>Hoy</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={navigateToNextDay}>
            <Ionicons name="chevron-forward" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      )}

      {/* Timeline */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            tintColor={tintColor}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timelineContainer}>
          {/* Current Time Indicator */}
          {showCurrentTimeIndicator && currentTimePosition !== null && isToday(currentDate) && (
            <View 
              style={[
                styles.currentTimeIndicator, 
                { top: currentTimePosition }
              ]}
            >
              <View style={styles.currentTimeDot} />
            </View>
          )}

          {/* Time Slots */}
          {visibleTimeSlots.map((timeSlot) => {
            const isAvailable = isTimeSlotAvailable(timeSlot);
            const appointment = getAppointmentAtTime(timeSlot);
            const isCurrentTimeSlot = currentTimePosition !== null && 
              Math.abs(currentTimePosition - (visibleTimeSlots.indexOf(timeSlot) * 60)) < 30;

            return (
              <CalendarTimeSlot
                key={timeSlot}
                time={timeSlot}
                isAvailable={isAvailable}
                appointment={appointment}
                onPress={() => appointment ? handleAppointmentPress(timeSlot) : handleSlotPress(timeSlot)}
                onLongPress={() => handleSlotPress(timeSlot)}
                height={60}
                showTime={true}
                timeFormat={config?.timeFormat || '24h'}
                isCurrentTime={isCurrentTimeSlot}
                disabled={loading.appointments}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default OptimizedDailyCalendarView;
