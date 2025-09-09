// src/app/(client-tabs)/booking/daily.tsx
// Vista diaria del calendario - Página dedicada para navegación futura

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import OptimizedDailyCalendarView from '@/components/calendar/OptimizedDailyCalendarView';
import type { CalendarInteractions } from '@/types/calendar';
import { Alert } from 'react-native';

// TODO: Obtener brandId del contexto de autenticación
const CURRENT_BRAND_ID = 1;

export default function DailyCalendarScreen() {
  const { colors } = useTheme();

  // Configuración del calendario optimizada para móviles
  const calendarConfig = {
    slotDuration: 30, // 30 minutos
    showWeekends: true, // Mostrar fines de semana en vista dedicada
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
        'Detalles de Cita',
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
  });

  return (
    <View style={styles.container}>
      <OptimizedDailyCalendarView
        brandId={CURRENT_BRAND_ID}
        config={calendarConfig}
        interactions={calendarInteractions}
        showHeader={true}
        showCurrentTimeIndicator={true}
      />
    </View>
  );
}
