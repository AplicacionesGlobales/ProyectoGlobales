// src/app/(client-tabs)/booking/index.tsx
// Archivo principal reestructurado
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { CalendarProvider, useCalendar } from '@/contexts/CalendarContext';
import CalendarViewSwitcher from '@/components/calendar/CalendarViewSwitcher';
import SimpleDayView from '@/components/calendar/SimpleDayView';
import SimpleWeekView from '@/components/calendar/SimpleWeekView';
import SimpleMonthView from '@/components/calendar/SimpleMonthView';

// Obtener brandId del entorno
const BRAND_ID = parseInt(process.env.EXPO_PUBLIC_BRAND_ID || '1');

const CalendarContent: React.FC = () => {
  const { colors } = useTheme();
  const { state } = useCalendar();

  const handleSlotPress = (time: string) => {
    Alert.alert(
      'Agendar Cita',
      `¿Desea agendar una cita para las ${time}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Agendar', onPress: () => console.log('Agendar:', time) }
      ]
    );
  };

  const handleAppointmentPress = (appointment: any) => {
    Alert.alert(
      'Cita Reservada',
      'Este horario ya está ocupado.',
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'day':
        return (
          <SimpleDayView
            onSlotPress={handleSlotPress}
            onAppointmentPress={handleAppointmentPress}
          />
        );
      case 'week':
        return <SimpleWeekView />;
      case 'month':
        return <SimpleMonthView />;
      default:
        return <SimpleDayView onSlotPress={handleSlotPress} />;
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
      <CalendarViewSwitcher />
      <View style={styles.content}>
        {renderCurrentView()}
      </View>
    </View>
  );
};

export default function BookingScreen() {
  return (
    <CalendarProvider initialBrandId={BRAND_ID}>
      <CalendarContent />
    </CalendarProvider>
  );
}
