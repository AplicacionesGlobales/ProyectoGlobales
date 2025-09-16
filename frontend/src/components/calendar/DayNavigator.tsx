
// src/components/calendar/DayNavigator.tsx
// Componente simple de navegación entre días
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useCalendar } from '@/contexts/CalendarContext';

interface DayNavigatorProps {
  showToday?: boolean;
  compact?: boolean;
}

const DayNavigator: React.FC<DayNavigatorProps> = ({ 
  showToday = true, 
  compact = false 
}) => {
  const { colors } = useTheme();
  const { state, actions } = useCalendar();

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: compact ? 'short' : 'long',
      day: 'numeric',
      month: compact ? 'short' : 'long'
    });
  };

  const isToday = (date: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: compact ? 8 : 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.textSecondary + '20',
    },
    dateContainer: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 16,
    },
    dateText: {
      fontSize: compact ? 16 : 18,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      textTransform: 'capitalize',
    },
    todayBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginTop: 4,
    },
    todayText: {
      fontSize: 10,
      color: colors.surface,
      fontWeight: '500',
    },
    navButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.textSecondary + '15',
    },
    todayButton: {
      position: 'absolute',
      right: 16,
      top: '50%',
      transform: [{ translateY: -12 }],
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    todayButtonText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.navButton} 
        onPress={actions.navigateToPreviousDay}
      >
        <Ionicons name="chevron-back" size={20} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.dateContainer}
        onPress={actions.navigateToToday}
      >
        <Text style={styles.dateText}>
          {formatDate(state.currentDate)}
        </Text>
        {isToday(state.currentDate) && (
          <View style={styles.todayBadge}>
            <Text style={styles.todayText}>Hoy</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navButton} 
        onPress={actions.navigateToNextDay}
      >
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </TouchableOpacity>

      {showToday && !isToday(state.currentDate) && (
        <TouchableOpacity 
          style={styles.todayButton}
          onPress={actions.navigateToToday}
        >
          <Text style={styles.todayButtonText}>Hoy</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default DayNavigator;