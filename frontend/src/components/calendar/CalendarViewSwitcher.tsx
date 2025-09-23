
// src/components/calendar/CalendarViewSwitcher.tsx
// Versión simplificada que usa el contexto
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useCalendar, CalendarViewType } from '@/contexts/CalendarContext';

interface CalendarViewSwitcherProps {
  showDateNavigation?: boolean;
  compact?: boolean;
}

const CalendarViewSwitcher: React.FC<CalendarViewSwitcherProps> = ({
  showDateNavigation = true,
  compact = false
}) => {
  const { colors } = useTheme();
  const { state, actions } = useCalendar();

  const getViewIcon = (view: CalendarViewType) => {
    switch (view) {
      case 'day': return 'today-outline' as const;
      case 'week': return 'calendar-outline' as const;
      case 'month': return 'grid-outline' as const;
    }
  };

  const getViewLabel = (view: CalendarViewType) => {
    switch (view) {
      case 'day': return 'Día';
      case 'week': return 'Semana';
      case 'month': return 'Mes';
    }
  };

  const formatPeriod = (): string => {
    const date = new Date(state.currentDate + 'T12:00:00');
    
    switch (state.currentView) {
      case 'day':
        return date.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });
      case 'week':
        const weekStart = new Date(date);
        const dayOfWeek = weekStart.getDay();
        const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        weekStart.setDate(diff);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return `${weekStart.getDate()} - ${weekEnd.getDate()} de ${weekEnd.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
      case 'month':
        return date.toLocaleDateString('es-ES', {
          month: 'long',
          year: 'numeric'
        });
    }
  };

  const handlePrevious = () => {
    switch (state.currentView) {
      case 'day':
        actions.navigateToPreviousDay();
        break;
      case 'week':
        actions.navigateToPreviousWeek();
        break;
      case 'month':
        actions.navigateToPreviousMonth();
        break;
    }
  };

  const handleNext = () => {
    switch (state.currentView) {
      case 'day':
        actions.navigateToNextDay();
        break;
      case 'week':
        actions.navigateToNextWeek();
        break;
      case 'month':
        actions.navigateToNextMonth();
        break;
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.textSecondary + '20',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: compact ? 8 : 12,
    },
    periodContainer: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 16,
    },
    periodText: {
      fontSize: compact ? 16 : 18,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      textTransform: 'capitalize',
    },
    navButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.textSecondary + '15',
    },
    viewSelector: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingBottom: compact ? 8 : 12,
    },
    viewSelectorContainer: {
      flexDirection: 'row',
      backgroundColor: colors.textSecondary + '15',
      borderRadius: 12,
      padding: 4,
      flex: 1,
    },
    viewOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: compact ? 6 : 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    viewOptionActive: {
      backgroundColor: colors.primary,
    },
    viewOptionIcon: {
      marginRight: compact ? 4 : 6,
    },
    viewOptionText: {
      fontSize: compact ? 12 : 14,
      fontWeight: '500',
      color: colors.text + '80',
    },
    viewOptionTextActive: {
      color: colors.surface,
    },
  });

  return (
    <View style={styles.container}>
      {showDateNavigation && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.periodContainer} onPress={actions.navigateToToday}>
            <Text style={styles.periodText}>
              {formatPeriod()}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navButton} onPress={handleNext}>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.viewSelector}>
        <View style={styles.viewSelectorContainer}>
          {(['day', 'week', 'month'] as CalendarViewType[]).map((view) => (
            <TouchableOpacity
              key={view}
              style={[
                styles.viewOption,
                state.currentView === view && styles.viewOptionActive
              ]}
              onPress={() => actions.setView(view)}
            >
              <Ionicons
                name={getViewIcon(view)}
                size={compact ? 16 : 18}
                color={state.currentView === view ? colors.surface : colors.text + '80'}
                style={styles.viewOptionIcon}
              />
              <Text style={[
                styles.viewOptionText,
                state.currentView === view && styles.viewOptionTextActive
              ]}>
                {getViewLabel(view)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

export default CalendarViewSwitcher;