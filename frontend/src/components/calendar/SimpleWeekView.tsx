// src/components/calendar/SimpleWeekView.tsx
// Vista semanal simplificada tipo cards
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  RefreshControl,
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useCalendar } from '@/contexts/CalendarContext';

interface SimpleWeekViewProps {
  onDateSelect?: (date: string) => void;
}

const SimpleWeekView: React.FC<SimpleWeekViewProps> = ({ onDateSelect }) => {
  const { colors } = useTheme();
  const { state, actions } = useCalendar();

  const generateWeekDays = () => {
    const currentDate = new Date(state.currentDate + 'T12:00:00');
    const dayOfWeek = currentDate.getDay();
    const startOfWeek = new Date(currentDate);
    const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const weekDays = [];
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      
      const dateStr = day.toISOString().split('T')[0];
      
      // Buscar citas para este día en los datos de la semana
      const dayAppointments = state.weekData?.filter((apt: any) => {
        const aptDate = new Date(apt.startTime).toISOString().split('T')[0];
        return aptDate === dateStr;
      }) || [];

      weekDays.push({
        date: dateStr,
        day: day.getDate(),
        dayName: day.toLocaleDateString('es-ES', { weekday: 'short' }),
        isToday: dateStr === today,
        appointmentCount: dayAppointments.length,
        hasAppointments: dayAppointments.length > 0
      });
    }

    return weekDays;
  };

  const weekDays = generateWeekDays();

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
    weekContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    dayCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
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
    dayInfo: {
      flex: 1,
    },
    dayHeader: {
      flexDirection: 'row',
      alignItems: 'center',
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
    appointmentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    appointmentCount: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginRight: 4,
    },
    appointmentLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    noAppointments: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    chevronIcon: {
      marginLeft: 8,
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

  if (state.loading.week) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Cargando semana...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      refreshControl={
        <RefreshControl
          refreshing={state.loading.week}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.weekContainer}>
        {weekDays.map((dayData) => (
          <TouchableOpacity
            key={dayData.date}
            style={[
              styles.dayCard,
              dayData.isToday && styles.dayCardToday,
            ]}
            onPress={() => handleDatePress(dayData.date)}
          >
            <View style={styles.dayInfo}>
              <View style={styles.dayHeader}>
                <Text style={[
                  styles.dayName,
                  dayData.isToday && styles.dayNameToday
                ]}>
                  {dayData.dayName}
                </Text>
                <Text style={[
                  styles.dayNumber,
                  dayData.isToday && styles.dayNumberToday
                ]}>
                  {dayData.day}
                </Text>
                {dayData.isToday && (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayText}>Hoy</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.appointmentInfo}>
                {dayData.hasAppointments ? (
                  <>
                    <Text style={styles.appointmentCount}>
                      {dayData.appointmentCount}
                    </Text>
                    <Text style={styles.appointmentLabel}>
                      {dayData.appointmentCount === 1 ? 'cita' : 'citas'}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.noAppointments}>Sin citas</Text>
                )}
              </View>
            </View>
            
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={colors.textSecondary} 
              style={styles.chevronIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default SimpleWeekView;