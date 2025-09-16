// src/app/(client-tabs)/booking/index.tsx
// Vista principal del módulo de agendamiento con todas las vistas integradas

import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import CalendarViewSwitcher, { CalendarViewType } from '@/components/calendar/CalendarViewSwitcher';
import OptimizedDailyCalendarView from '@/components/calendar/OptimizedDailyCalendarView';
import WeeklyCalendarView from '@/components/calendar/WeeklyCalendarView';
import MonthlyCalendarView from '@/components/calendar/MonthlyCalendarView';
import type { CalendarInteractions } from '@/types/calendar';

// TODO: Obtener brandId del contexto de autenticación
const CURRENT_BRAND_ID = 1;

export default function BookingScreen() {
  const { colors } = useTheme();
  const [currentView, setCurrentView] = useState<CalendarViewType>('day');
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Configuración del calendario optimizada para móviles
  const calendarConfig = {
    slotDuration: 30,
    showWeekends: true,
    timeFormat: '24h' as const,
    firstDayOfWeek: 1 as 0 | 1,
    autoRefresh: true,
    refreshInterval: 30000,
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

  const handleViewChange = (view: CalendarViewType) => {
    setCurrentView(view);
  };

  const handleDateChange = (date: string) => {
    setCurrentDate(date);
  };

  const handleToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  const handleDateSelect = (date: string) => {
    // Al seleccionar una fecha en vista mensual, cambiar a vista diaria
    setCurrentDate(date);
    setCurrentView('day');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'day':
        return (
          <OptimizedDailyCalendarView
            brandId={CURRENT_BRAND_ID}
            initialDate={currentDate}
            config={calendarConfig}
            interactions={calendarInteractions}
            showHeader={false}
            showCurrentTimeIndicator={true}
          />
        );
      case 'week':
        return (
          <WeeklyCalendarView
            brandId={CURRENT_BRAND_ID}
            initialDate={currentDate}
            config={calendarConfig}
            interactions={calendarInteractions}
            showHeader={false}
          />
        );
      case 'month':
        return (
          <MonthlyCalendarView
            brandId={CURRENT_BRAND_ID}
            initialDate={currentDate}
            config={calendarConfig}
            interactions={calendarInteractions}
            showHeader={false}
            onDateSelect={handleDateSelect}
          />
        );
      default:
        return null;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      {/* Calendar View Switcher */}
      <CalendarViewSwitcher
        currentView={currentView}
        onViewChange={handleViewChange}
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onToday={handleToday}
        showDateNavigation={true}
        compact={false}
      />

      {/* Current Calendar View */}
      <View style={styles.content}>
        {renderCurrentView()}
      </View>
    </View>
  );
}