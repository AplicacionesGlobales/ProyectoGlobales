// src/app/examples/calendar-comparison.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { CalendarComparisonScreen } from '@/components/ui/CalendarComparisonScreen';

export default function CalendarComparisonExample() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Comparación de Calendarios',
          headerShown: true
        }} 
      />
      
      <CalendarComparisonScreen />
    </>
  );
}
