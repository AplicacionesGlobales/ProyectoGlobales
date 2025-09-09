// src/components/calendar/WeeklyCalendarView.tsx
// Vista semanal simplificada tipo cards con indicadores de ocupación

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useOptimizedWeeklyCalendar } from '@/hooks/useOptimizedWeeklyCalendar';
import type { CalendarConfiguration, CalendarInteractions } from '@/types/calendar';

const { width: screenWidth } = Dimensions.get('window');

interface WeeklyCalendarViewProps {
  brandId: number;
  initialDate?: string;
  config?: Partial<CalendarConfiguration>;
  interactions?: CalendarInteractions;
  showHeader?: boolean;
  onDateSelect?: (date: string) => void;
}

interface WeekDayData {
  date: string;
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  occupancyPercentage: number;
  isBusinessOpen: boolean;
  isToday: boolean;
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  brandId,
  initialDate,
  config,
  interactions,
  showHeader = true,
  onDateSelect
}) => {
  const { colors } = useTheme();
  
  const {
    currentWeekStart,
    weekData,
    weekDays,
    loading,
    error,
    isRefreshing,
    navigateToPreviousWeek,
    navigateToNextWeek,
    navigateToCurrentWeek,
    refreshData,
    formatWeekRange,
    getVisibleDays,
    getDayAppointments
  } = useOptimizedWeeklyCalendar({
    brandId,
    initialDate,
    config
  });

  const visibleDays = getVisibleDays();

  // Función auxiliar para comparar fechas sin problemas de zona horaria
  const isSameDate = (date1: string, date2: string): boolean => {
    try {
      // Normalizar ambas fechas a formato YYYY-MM-DD
      const normalizeDate = (dateStr: string): string => {
        const date = new Date(dateStr + 'T12:00:00.000'); // Usar mediodía para evitar problemas de zona
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      return normalizeDate(date1) === normalizeDate(date2);
    } catch (error) {
      console.error('Error comparing dates:', error, { date1, date2 });
      return false;
    }
  };

  // Procesar datos para cada día de la semana
  const processWeekData = (): WeekDayData[] => {
    return visibleDays.map(day => {
      const appointments = getDayAppointments(day.date);
      const confirmedAppointments = appointments.filter(apt => apt.status === 'CONFIRMED').length;
      const pendingAppointments = appointments.filter(apt => apt.status === 'PENDING').length;
      
      // Calcular ocupación basado en horas de negocio
      const businessMinutes = day.businessHours.isClosed ? 0 : 
        (parseInt(day.businessHours.end.split(':')[0]) - parseInt(day.businessHours.start.split(':')[0])) * 60;
      const occupiedMinutes = appointments.reduce((total, apt) => total + apt.duration, 0);
      const occupancyPercentage = businessMinutes > 0 ? (occupiedMinutes / businessMinutes) * 100 : 0;

      // Obtener fecha actual sin problemas de zona horaria
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      return {
        date: day.date,
        totalAppointments: appointments.length,
        confirmedAppointments,
        pendingAppointments,
        occupancyPercentage,
        isBusinessOpen: !day.businessHours.isClosed,
        isToday: isSameDate(day.date, todayStr)
      };
    });
  };

  const weekDaysData = processWeekData();

  const handleDayPress = (date: string) => {
    if (onDateSelect) {
      onDateSelect(date);
    } else {
      // Acción por defecto: navegar a vista diaria
      console.log('Navigate to day view:', date);
    }
  };

  const formatDayName = (date: string): string => {
    // Evitar problemas de zona horaria creando fecha local explícita
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('es-ES', {
      weekday: 'short'
    });
  };

  const formatDayNumber = (date: string): string => {
    // Evitar problemas de zona horaria creando fecha local explícita
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.getDate().toString();
  };

  const getOccupancyColor = (percentage: number): string => {
    if (percentage === 0) return colors.textSecondary + '20';
    if (percentage < 25) return '#10B981'; // green
    if (percentage < 50) return '#F59E0B'; // amber
    if (percentage < 75) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  const getOccupancyLevel = (percentage: number): string => {
    if (percentage === 0) return 'Libre';
    if (percentage < 25) return 'Bajo';
    if (percentage < 50) return 'Medio';
    if (percentage < 75) return 'Alto';
    return 'Completo';
  };

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
    scrollContainer: {
      flex: 1,
    },
    weekContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    weekSummary: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.textSecondary + '20',
    },
    summaryTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    summaryText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    daysGrid: {
      gap: 12,
    },
    dayCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.textSecondary + '20',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dayCardToday: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: colors.primary + '05',
    },
    dayCardClosed: {
      opacity: 0.6,
      backgroundColor: colors.textSecondary + '05',
    },
    dayInfo: {
      flex: 1,
    },
    dayHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    dayName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textTransform: 'capitalize',
    },
    dayNameToday: {
      color: colors.primary,
    },
    dayNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginLeft: 8,
    },
    dayNumberToday: {
      color: colors.primary,
    },
    todayBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      marginLeft: 8,
    },
    todayText: {
      fontSize: 10,
      color: colors.surface,
      fontWeight: '500',
    },
    dayStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    statLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    },
    occupancyIndicator: {
      alignItems: 'center',
      minWidth: 60,
    },
    occupancyDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginBottom: 4,
    },
    occupancyLevel: {
      fontSize: 10,
      fontWeight: '500',
      textAlign: 'center',
    },
    occupancyPercentage: {
      fontSize: 8,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    closedIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    closedText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    chevronIcon: {
      marginLeft: 8,
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

  // Calcular estadísticas de la semana
  const weekStats = {
    totalAppointments: weekDaysData.reduce((sum, day) => sum + day.totalAppointments, 0),
    totalBusinessDays: weekDaysData.filter(day => day.isBusinessOpen).length,
    averageOccupancy: weekDaysData
      .filter(day => day.isBusinessOpen)
      .reduce((sum, day) => sum + day.occupancyPercentage, 0) / 
      weekDaysData.filter(day => day.isBusinessOpen).length || 0
  };

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

      <ScrollView
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
        <View style={styles.weekContainer}>
          {/* Resumen semanal */}
          <View style={styles.weekSummary}>
            <Text style={styles.summaryTitle}>Resumen de la semana</Text>
            <Text style={styles.summaryText}>
              {weekStats.totalAppointments} citas programadas • {weekStats.totalBusinessDays} días laborales • {weekStats.averageOccupancy.toFixed(1)}% ocupación promedio
            </Text>
          </View>

          {/* Días de la semana */}
          <View style={styles.daysGrid}>
            {weekDaysData.map((dayData) => (
              <TouchableOpacity
                key={dayData.date}
                style={[
                  styles.dayCard,
                  dayData.isToday && styles.dayCardToday,
                  !dayData.isBusinessOpen && styles.dayCardClosed,
                ]}
                onPress={() => handleDayPress(dayData.date)}
                disabled={loading.appointments}
              >
                <View style={styles.dayInfo}>
                  <View style={styles.dayHeader}>
                    <Text style={[
                      styles.dayName,
                      dayData.isToday && styles.dayNameToday
                    ]}>
                      {formatDayName(dayData.date)}
                    </Text>
                    <Text style={[
                      styles.dayNumber,
                      dayData.isToday && styles.dayNumberToday
                    ]}>
                      {formatDayNumber(dayData.date)}
                    </Text>
                    {dayData.isToday && (
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayText}>Hoy</Text>
                      </View>
                    )}
                  </View>

                  {dayData.isBusinessOpen ? (
                    <View style={styles.dayStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{dayData.totalAppointments}</Text>
                        <Text style={styles.statLabel}>Citas</Text>
                      </View>
                      {dayData.confirmedAppointments > 0 && (
                        <View style={styles.statItem}>
                          <Text style={styles.statNumber}>{dayData.confirmedAppointments}</Text>
                          <Text style={styles.statLabel}>Confirmadas</Text>
                        </View>
                      )}
                      {dayData.pendingAppointments > 0 && (
                        <View style={styles.statItem}>
                          <Text style={styles.statNumber}>{dayData.pendingAppointments}</Text>
                          <Text style={styles.statLabel}>Pendientes</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.closedIndicator}>
                      <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
                      <Text style={styles.closedText}>Cerrado</Text>
                    </View>
                  )}
                </View>

                {/* Indicador de ocupación */}
                {dayData.isBusinessOpen && (
                  <View style={styles.occupancyIndicator}>
                    <View style={[
                      styles.occupancyDot,
                      { backgroundColor: getOccupancyColor(dayData.occupancyPercentage) }
                    ]} />
                    <Text style={[
                      styles.occupancyLevel,
                      { color: getOccupancyColor(dayData.occupancyPercentage) }
                    ]}>
                      {getOccupancyLevel(dayData.occupancyPercentage)}
                    </Text>
                    <Text style={styles.occupancyPercentage}>
                      {dayData.occupancyPercentage.toFixed(0)}%
                    </Text>
                  </View>
                )}

                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={colors.textSecondary} 
                  style={styles.chevronIcon}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default WeeklyCalendarView;