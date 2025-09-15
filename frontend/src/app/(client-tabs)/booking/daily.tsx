// src/app/(client-tabs)/booking/daily.tsx
// Página de vista diaria simplificada
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import DayNavigator from '@/components/calendar/DayNavigator';
import SimpleDayView from '@/components/calendar/SimpleDayView';

const BRAND_ID = parseInt(process.env.EXPO_PUBLIC_BRAND_ID || '1');

export default function DailyCalendarScreen() {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });

  return (
    <CalendarProvider initialBrandId={BRAND_ID} initialView="day">
      <View style={styles.container}>
        <DayNavigator />
        <SimpleDayView />
      </View>
    </CalendarProvider>
  );
}