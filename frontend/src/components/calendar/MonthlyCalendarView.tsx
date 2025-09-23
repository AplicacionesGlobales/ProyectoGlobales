// src/components/calendar/MonthlyCalendarView.tsx
// Vista mensual del calendario con indicadores de ocupación

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useOptimizedMonthlyCalendar } from '@/hooks/useOptimizedMonthlyCalendar';
import StatusIndicator from './StatusIndicator';
import type { CalendarConfiguration, CalendarInteractions } from '@/types/calendar';

const { width: screenWidth } = Dimensions.get('window');
const CELL_SIZE = (screenWidth - 32) / 7; // 16px padding on each side

interface MonthlyCalendarViewProps {
  brandId: number;
  initialDate?: string;
  config?: Partial<CalendarConfiguration>;
  interactions?: CalendarInteractions;
  showHeader?: boolean;
  onDateSelect?: (date: string) => void;
}

interface DayData {
  date: string;
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  occupancyPercentage: number;
  isBusinessOpen: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  brandId,
  initialDate,
  config,
  interactions,
  showHeader = true,
  onDateSelect
}) => {
  const { colors } = useTheme();

  const {
    currentMonth,
    monthData,
    loading,
    error,
    isRefreshing,
    navigateToMonth,
    navigateToPreviousMonth,
    navigateToNextMonth,
    navigateToCurrentMonth,
    refreshData,
    formatMonthYear
  } = useOptimizedMonthlyCalendar({
    brandId,
    initialDate,
    config
  });

  // Generar grid del calendario (6 semanas x 7 días)
  const generateCalendarGrid = (): DayData[] => {
    if (!monthData) return [];

    const year = parseInt(currentMonth.split('-')[0]);
    const month = parseInt(currentMonth.split('-')[1]) - 1; // 0-indexed

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);

    // Ajustar al lunes como primer día de la semana
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - daysToSubtract);

    const grid: DayData[] = [];
    // Obtener fecha actual sin problemas de zona horaria
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    for (let i = 0; i < 42; i++) { // 6 semanas x 7 días
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      // Formatear fecha local sin problemas de zona horaria
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const dayInfo = monthData.days.find(d => d.date === dateStr);

      grid.push({
        date: dateStr,
        totalAppointments: dayInfo?.totalAppointments || 0,
        confirmedAppointments: dayInfo?.confirmedAppointments || 0,
        pendingAppointments: dayInfo?.pendingAppointments || 0,
        completedAppointments: dayInfo?.completedAppointments || 0,
        cancelledAppointments: dayInfo?.cancelledAppointments || 0,
        occupancyPercentage: dayInfo?.occupancyPercentage || 0,
        isBusinessOpen: dayInfo?.isBusinessOpen ?? true,
        isToday: dateStr === today,
        isCurrentMonth: currentDate.getMonth() === month
      });
    }

    return grid;
  };

  const calendarGrid = generateCalendarGrid();

  const handleDayPress = (date: string) => {
    if (onDateSelect) {
      onDateSelect(date);
    } else {
      // Acción por defecto: navegar a vista diaria
      Alert.alert(
        'Ver día',
        `Fecha seleccionada: ${formatDate(date)}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ver detalles', onPress: () => console.log('Navigate to day view:', date) }
        ]
      );
    }
  };

  const formatDate = (dateStr: string): string => {
    // Evitar problemas de zona horaria creando fecha local explícita
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
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
    monthTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      textTransform: 'capitalize',
    },
    navButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.textSecondary + '15',
    },
    scrollContainer: {
      flex: 1,
    },
    calendarContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    weekHeader: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    weekHeaderCell: {
      width: CELL_SIZE,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    weekHeaderText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: CELL_SIZE,
      height: CELL_SIZE,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.textSecondary + '10',
      backgroundColor: colors.surface,
    },
    dayCellToday: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    dayCellInactive: {
      opacity: 0.3,
    },
    dayCellClosed: {
      backgroundColor: colors.textSecondary + '05',
    },
    dayNumber: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 2,
    },
    dayNumberToday: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    dayNumberInactive: {
      color: colors.textSecondary,
    },
    occupancyIndicator: {
      flexDirection: 'row',
      gap: 2,
    },
    occupancyDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
    },
    appointmentCount: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    },
    summaryContainer: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.textSecondary + '20',
    },
    summaryTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    summaryLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    legend: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.textSecondary + '20',
    },
    legendTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    legendItems: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    legendText: {
      fontSize: 12,
      color: colors.textSecondary,
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

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  if (error) {
    return (
      <View style={styles.container}>
        {showHeader && (
          <View style={styles.header}>
            <TouchableOpacity style={styles.navButton} onPress={navigateToPreviousMonth}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <Text style={styles.monthTitle}>
              {formatMonthYear(currentMonth)}
            </Text>

            <TouchableOpacity style={styles.navButton} onPress={navigateToNextMonth}>
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
          <TouchableOpacity style={styles.navButton} onPress={navigateToPreviousMonth}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={navigateToCurrentMonth}>
            <Text style={styles.monthTitle}>
              {formatMonthYear(currentMonth)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={navigateToNextMonth}>
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
        {/* Resumen mensual */}
        {monthData?.summary && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Resumen del mes</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total de citas</Text>
              <Text style={styles.summaryValue}>{monthData.summary.totalAppointments}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Días con citas</Text>
              <Text style={styles.summaryValue}>{monthData.summary.daysWithAppointments}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ocupación promedio</Text>
              <Text style={styles.summaryValue}>{monthData.summary.averageOccupancyPercentage.toFixed(1)}%</Text>
            </View>
          </View>
        )}

        {/* Calendario */}
        <View style={styles.calendarContainer}>
          {/* Header de días de la semana */}
          <View style={styles.weekHeader}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.weekHeaderCell}>
                <Text style={styles.weekHeaderText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Grid del calendario */}
          <View style={styles.calendarGrid}>
            {calendarGrid.map((dayData, index) => {
              const isInactive = !dayData.isCurrentMonth;
              const isClosed = !dayData.isBusinessOpen;

              return (
                <TouchableOpacity
                  key={`${dayData.date}-${index}`}
                  style={[
                    styles.dayCell,
                    dayData.isToday && styles.dayCellToday,
                    isInactive && styles.dayCellInactive,
                    isClosed && styles.dayCellClosed,
                  ]}
                  onPress={() => handleDayPress(dayData.date)}
                  disabled={loading.appointments}
                >
                  <Text style={[
                    styles.dayNumber,
                    dayData.isToday && styles.dayNumberToday,
                    isInactive && styles.dayNumberInactive,
                  ]}>
                    {(() => {
                      // Evitar problemas de zona horaria creando fecha local explícita
                      const [year, month, day] = dayData.date.split('-').map(Number);
                      const date = new Date(year, month - 1, day);
                      return date.getDate();
                    })()}
                  </Text>

                  {/* Indicadores de estado con StatusIndicator */}
                  {dayData.isCurrentMonth && dayData.isBusinessOpen && dayData.totalAppointments > 0 && (
                    <StatusIndicator
                      variant="dots"
                      size="small"
                      statusCounts={{
                        CONFIRMED: dayData.confirmedAppointments,
                        PENDING: dayData.pendingAppointments,
                        COMPLETED: dayData.completedAppointments,
                        CANCELLED: dayData.cancelledAppointments
                      }}
                      showText={false}
                      maxDots={3}
                    />
                  )}

                  {/* Contador de citas */}
                  {dayData.totalAppointments > 0 && (
                    <Text style={styles.appointmentCount}>
                      {dayData.totalAppointments}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Leyenda */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Nivel de ocupación</Text>
          <View style={styles.legendItems}>
            {[
              { level: 'Libre', color: colors.textSecondary + '20' },
              { level: 'Bajo', color: '#10B981' },
              { level: 'Medio', color: '#F59E0B' },
              { level: 'Alto', color: '#F97316' },
              { level: 'Completo', color: '#EF4444' },
            ].map((item) => (
              <View key={item.level} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.level}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default MonthlyCalendarView;