// src/components/calendar/CalendarViewSwitcher.tsx
// Componente selector de vista de calendario con navegación contextual

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');

export type CalendarViewType = 'day' | 'week' | 'month';

interface CalendarViewSwitcherProps {
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  currentDate: string;
  onDateChange: (date: string) => void;
  onToday: () => void;
  showDateNavigation?: boolean;
  compact?: boolean;
}

const CalendarViewSwitcher: React.FC<CalendarViewSwitcherProps> = ({
  currentView,
  onViewChange,
  currentDate,
  onDateChange,
  onToday,
  showDateNavigation = true,
  compact = false
}) => {
  const { colors } = useTheme();
  const [viewPreference, setViewPreference] = useState<CalendarViewType>(currentView);

  // Persistir preferencia de vista
  useEffect(() => {
    loadViewPreference();
  }, []);

  useEffect(() => {
    saveViewPreference(currentView);
  }, [currentView]);

  const loadViewPreference = async () => {
    try {
      const savedView = await AsyncStorage.getItem('calendar_view_preference');
      if (savedView && ['day', 'week', 'month'].includes(savedView)) {
        setViewPreference(savedView as CalendarViewType);
      }
    } catch (error) {
      console.log('Error loading view preference:', error);
    }
  };

  const saveViewPreference = async (view: CalendarViewType) => {
    try {
      await AsyncStorage.setItem('calendar_view_preference', view);
      setViewPreference(view);
    } catch (error) {
      console.log('Error saving view preference:', error);
    }
  };

  const handleViewChange = (view: CalendarViewType) => {
    onViewChange(view);
    saveViewPreference(view);
  };

  const handlePrevious = () => {
    const currentDateObj = new Date(currentDate);
    let newDate: Date;

    switch (currentView) {
      case 'day':
        newDate = new Date(currentDateObj);
        newDate.setDate(currentDateObj.getDate() - 1);
        break;
      case 'week':
        newDate = new Date(currentDateObj);
        newDate.setDate(currentDateObj.getDate() - 7);
        break;
      case 'month':
        newDate = new Date(currentDateObj);
        newDate.setMonth(currentDateObj.getMonth() - 1);
        break;
      default:
        return;
    }

    onDateChange(newDate.toISOString().split('T')[0]);
  };

  const handleNext = () => {
    const currentDateObj = new Date(currentDate);
    let newDate: Date;

    switch (currentView) {
      case 'day':
        newDate = new Date(currentDateObj);
        newDate.setDate(currentDateObj.getDate() + 1);
        break;
      case 'week':
        newDate = new Date(currentDateObj);
        newDate.setDate(currentDateObj.getDate() + 7);
        break;
      case 'month':
        newDate = new Date(currentDateObj);
        newDate.setMonth(currentDateObj.getMonth() + 1);
        break;
      default:
        return;
    }

    onDateChange(newDate.toISOString().split('T')[0]);
  };

  const formatCurrentPeriod = (): string => {
    // Usar formato ISO para evitar problemas de zona horaria
    const [year, month, day] = currentDate.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Crear fecha local explícita
    
    switch (currentView) {
      case 'day':
        const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        
        return `${dayNames[date.getDay()]}, ${day} de ${monthNames[date.getMonth()]}`;
      
      case 'week':
        // Calcular inicio y fin de semana
        const startOfWeek = new Date(date);
        const dayOfWeek = startOfWeek.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Lunes como primer día
        startOfWeek.setDate(startOfWeek.getDate() + diff);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const monthNames2 = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                           'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        
        return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} de ${monthNames2[endOfWeek.getMonth()]} ${endOfWeek.getFullYear()}`;
      
      case 'month':
        const monthNames3 = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                           'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        
        return `${monthNames3[date.getMonth()]} ${date.getFullYear()}`;
      
      default:
        return '';
    }
  };

  const getViewIcon = (view: CalendarViewType) => {
    switch (view) {
      case 'day': return 'today-outline' as const;
      case 'week': return 'calendar-outline' as const;
      case 'month': return 'grid-outline' as const;
      default: return 'calendar-outline' as const;
    }
  };

  const isToday = (date: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
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
    },
    todayBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      marginTop: 2,
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
    quickActions: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingBottom: compact ? 8 : 12,
      gap: 8,
    },
    quickActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: colors.textSecondary + '15',
    },
    quickActionText: {
      marginLeft: 4,
      fontSize: 12,
      color: colors.text,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      {/* Navegación de período */}
      {showDateNavigation && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.periodContainer} onPress={onToday}>
            <Text style={styles.periodText}>
              {formatCurrentPeriod()}
            </Text>
            {currentView === 'day' && isToday(currentDate) && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayText}>Hoy</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={handleNext}>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* Selector de vista */}
      <View style={styles.viewSelector}>
        <View style={styles.viewSelectorContainer}>
          {(['day', 'week', 'month'] as CalendarViewType[]).map((view) => (
            <TouchableOpacity
              key={view}
              style={[
                styles.viewOption,
                currentView === view && styles.viewOptionActive
              ]}
              onPress={() => handleViewChange(view)}
            >
              <Ionicons
                name={getViewIcon(view)}
                size={compact ? 16 : 18}
                color={currentView === view ? colors.surface : colors.text + '80'}
                style={styles.viewOptionIcon}
              />
              <Text style={[
                styles.viewOptionText,
                currentView === view && styles.viewOptionTextActive
              ]}>
                {view === 'day' ? 'Día' : view === 'week' ? 'Semana' : 'Mes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Acciones rápidas */}
      {!compact && (
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={onToday}
          >
            <Ionicons name="today-outline" size={14} color={colors.text} />
            <Text style={styles.quickActionText}>Hoy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => Alert.alert('Próximamente', 'Filtros en desarrollo')}
          >
            <Ionicons name="filter-outline" size={14} color={colors.text} />
            <Text style={styles.quickActionText}>Filtrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => Alert.alert('Próximamente', 'Configuración en desarrollo')}
          >
            <Ionicons name="settings-outline" size={14} color={colors.text} />
            <Text style={styles.quickActionText}>Config</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CalendarViewSwitcher;