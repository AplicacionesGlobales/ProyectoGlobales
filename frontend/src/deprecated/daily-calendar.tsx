// src/app/examples/daily-calendar.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { DailyCalendarView } from '@/components/ui/DailyCalendarView';

const EXAMPLE_BRAND_ID = 1; // Replace with actual brand ID

export default function DailyCalendarExample() {
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(null);

  const handleSlotPress = (timeSlot: string, date: string) => {
    Alert.alert(
      'Nuevo Agendamiento',
      `¿Desea agendar una cita para el ${date} a las ${timeSlot}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Agendar', 
          onPress: () => {
            // Here you would typically navigate to appointment creation
            console.log('Creating appointment for:', { date, timeSlot });
          }
        }
      ]
    );
  };

  const handleAppointmentPress = (appointmentId: number) => {
    Alert.alert(
      'Cita Seleccionada',
      `¿Qué desea hacer con la cita #${appointmentId}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Ver Detalles', 
          onPress: () => {
            setSelectedAppointment(appointmentId);
            console.log('Viewing appointment:', appointmentId);
          }
        },
        { 
          text: 'Editar', 
          onPress: () => {
            console.log('Editing appointment:', appointmentId);
          }
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Calendario Diario',
          headerShown: true
        }} 
      />
      
      <ThemedView style={styles.container}>
        <DailyCalendarView
          brandId={EXAMPLE_BRAND_ID}
          onSlotPress={handleSlotPress}
          onAppointmentPress={handleAppointmentPress}
          autoRefresh={true}
          refreshInterval={30000}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
