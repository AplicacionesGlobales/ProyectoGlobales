// src/components/calendar/SimpleMonthView.tsx
// Vista mensual simplificada
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  RefreshControl,
  StyleSheet,
  Dimensions 
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { MonthlyDayData } from '@/types/calendar';

const { width: screenWidth } = Dimensions.get('window');
const CELL_SIZE = (screenWidth - 32) / 7;

interface SimpleMonthViewProps {
  onDateSelect?: (date: string) => void;
}

const SimpleMonthView: React.FC<SimpleMonthViewProps> = ({ onDateSelect }) => {
  const { colors } = useTheme();
  const { state, actions } = useCalendar();

  const generateCalendarGrid = () => {
    if (!state.monthData) return [];

    const month = state.currentDate.substring(0, 7); // YYYY-MM
    const [year, monthNum] = month.split('-').map(Number);
    
    const firstDay = new Date(year, monthNum - 1, 1);
    const lastDay = new Date(year, monthNum, 0);
    const startDate = new Date(firstDay);
    
    // Ajustar al lunes como primer día
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - daysToSubtract);

    const grid = [];
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const dayInfo = state.monthData.days?.find((d: MonthlyDayData) => d.date === dateStr);
      
      grid.push({
        date: dateStr,
        day: currentDate.getDate(),
        isCurrentMonth: currentDate.getMonth() === monthNum - 1,
        isToday: dateStr === today,
        hasAppointments: (dayInfo?.totalAppointments || 0) > 0,
        appointmentCount: dayInfo?.totalAppointments || 0
      });
    }

    return grid;
  };

  const calendarGrid = generateCalendarGrid();
  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const handleRefresh = async () => {
    await actions.refreshCurrentView();
  };

  const handleDatePress = (date: string) => {
    if (onDateSelect) {
      onDateSelect(date);
    } else {
      // Cambiar a vista diaria
      actions.setDate(date);
      actions.setView('day');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      backgroundColor: colors.primary + '10',
    },
    dayCellInactive: {
      opacity: 0.3,
    },
    dayNumber: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    dayNumberToday: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    dayNumberInactive: {
      color: colors.textSecondary,
    },
    appointmentDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginTop: 2,
    },
    appointmentCount: {
      fontSize: 8,
      color: colors.primary,
      fontWeight: '500',
      marginTop: 1,
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

  if (state.loading.month) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Cargando calendario...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      refreshControl={
        <RefreshControl
          refreshing={state.loading.month}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.calendarContainer}>
        {/* Header de días */}
        <View style={styles.weekHeader}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.weekHeaderCell}>
              <Text style={styles.weekHeaderText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Grid del calendario */}
        <View style={styles.calendarGrid}>
          {calendarGrid.map((dayData, index) => (
            <TouchableOpacity
              key={`${dayData.date}-${index}`}
              style={[
                styles.dayCell,
                dayData.isToday && styles.dayCellToday,
                !dayData.isCurrentMonth && styles.dayCellInactive,
              ]}
              onPress={() => handleDatePress(dayData.date)}
            >
              <Text style={[
                styles.dayNumber,
                dayData.isToday && styles.dayNumberToday,
                !dayData.isCurrentMonth && styles.dayNumberInactive,
              ]}>
                {dayData.day}
              </Text>
              
              {dayData.hasAppointments && dayData.isCurrentMonth && (
                <>
                  <View style={styles.appointmentDot} />
                  {dayData.appointmentCount > 1 && (
                    <Text style={styles.appointmentCount}>
                      {dayData.appointmentCount}
                    </Text>
                  )}
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default SimpleMonthView;