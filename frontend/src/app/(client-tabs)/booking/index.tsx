// src/app/(client-tabs)/booking/index.tsx
// Vista principal del módulo de agendamiento - Selector de vista de calendario

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Alert 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import OptimizedDailyCalendarView from '@/components/calendar/OptimizedDailyCalendarView';
import type { CalendarInteractions } from '@/types/calendar';

const { width: screenWidth } = Dimensions.get('window');

// TODO: Obtener brandId del contexto de autenticación
const CURRENT_BRAND_ID = 1;

export default function BookingScreen() {
  const { colors } = useTheme();
  const [currentView, setCurrentView] = useState<'day' | 'week'>('day');

  // Configuración del calendario optimizada para móviles
  const calendarConfig = {
    slotDuration: 30, // 30 minutos
    showWeekends: false, // Solo días laborales por defecto
    timeFormat: '24h' as const,
    firstDayOfWeek: 1 as 0 | 1, // Lunes
    autoRefresh: true,
    refreshInterval: 30000, // 30 segundos
  };

  // Interacciones del calendario
  const calendarInteractions: CalendarInteractions = {
    onSlotPress: (date: string, time: string) => {
      Alert.alert(
        'Agendar Cita',
        `¿Desea agendar una cita para el ${formatDate(date)} a las ${time}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar',
            onPress: () => {
              // TODO: Navegar a pantalla de creación de cita
              console.log('Crear cita:', { date, time });
              Alert.alert('Próximamente', 'Funcionalidad de creación de citas en desarrollo');
            }
          }
        ]
      );
    },
    onAppointmentPress: (appointment) => {
      Alert.alert(
        'Cita',
        `Cliente: ${appointment.client?.firstName} ${appointment.client?.lastName}\nServicio: ${appointment.serviceType?.name}\nEstado: ${appointment.status}`,
        [
          { text: 'Cerrar', style: 'cancel' },
          {
            text: 'Ver Detalles',
            onPress: () => {
              // TODO: Navegar a detalles de la cita
              console.log('Ver detalles cita:', appointment.id);
              Alert.alert('Próximamente', 'Funcionalidad de detalles de cita en desarrollo');
            }
          }
        ]
      );
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingTop: 60, // Safe area
      borderBottomWidth: 1,
      borderBottomColor: colors.textSecondary + '30',
      backgroundColor: colors.surface,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    settingsButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.textSecondary + '20',
    },
    viewSelector: {
      flexDirection: 'row',
      backgroundColor: colors.textSecondary + '20',
      borderRadius: 12,
      padding: 4,
    },
    viewOption: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    viewOptionActive: {
      backgroundColor: colors.primary,
    },
    viewOptionText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text + '80',
    },
    viewOptionTextActive: {
      color: colors.surface,
    },
    content: {
      flex: 1,
    },
    quickActions: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.textSecondary + '30',
      backgroundColor: colors.surface,
    },
    quickActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginRight: 12,
      borderRadius: 8,
      backgroundColor: colors.textSecondary + '20',
    },
    quickActionText: {
      marginLeft: 6,
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
  });

  const handleViewChange = (view: 'day' | 'week') => {
    setCurrentView(view);
    
    // Para navegación futura a vistas específicas
    if (view === 'week') {
      // router.push('/(client-tabs)/booking/weekly');
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'today':
        // El componente maneja esto internamente
        break;
      case 'new':
        Alert.alert('Próximamente', 'Creación rápida de citas en desarrollo');
        break;
      case 'search':
        Alert.alert('Próximamente', 'Búsqueda de citas en desarrollo');
        break;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Calendario</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => Alert.alert('Próximamente', 'Configuración en desarrollo')}
          >
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* View Selector */}
        <View style={styles.viewSelector}>
          <TouchableOpacity
            style={[
              styles.viewOption,
              currentView === 'day' && styles.viewOptionActive
            ]}
            onPress={() => handleViewChange('day')}
          >
            <Text style={[
              styles.viewOptionText,
              currentView === 'day' && styles.viewOptionTextActive
            ]}>
              Día
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewOption,
              currentView === 'week' && styles.viewOptionActive
            ]}
            onPress={() => handleViewChange('week')}
          >
            <Text style={[
              styles.viewOptionText,
              currentView === 'week' && styles.viewOptionTextActive
            ]}>
              Semana
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => handleQuickAction('today')}
        >
          <Ionicons name="today-outline" size={16} color={colors.text} />
          <Text style={styles.quickActionText}>Hoy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => handleQuickAction('new')}
        >
          <Ionicons name="add-outline" size={16} color={colors.text} />
          <Text style={styles.quickActionText}>Nueva</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => handleQuickAction('search')}
        >
          <Ionicons name="search-outline" size={16} color={colors.text} />
          <Text style={styles.quickActionText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Content */}
      <View style={styles.content}>
        {currentView === 'day' ? (
          <OptimizedDailyCalendarView
            brandId={CURRENT_BRAND_ID}
            config={calendarConfig}
            interactions={calendarInteractions}
            showHeader={false} // Usamos nuestro header personalizado
            showCurrentTimeIndicator={true}
          />
        ) : (
          // TODO: Implementar vista semanal
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.text, fontSize: 16 }}>
              Vista semanal en desarrollo
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
