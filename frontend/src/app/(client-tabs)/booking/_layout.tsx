// src/app/(client-tabs)/booking/_layout.tsx
// Layout con navegación interna para el módulo de agendamiento

import { Stack } from 'expo-router';
import React from 'react';

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Headers manejadas individualmente
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Calendario',
        }}
      />
      <Stack.Screen
        name="daily"
        options={{
          title: 'Vista Diaria',
        }}
      />
      <Stack.Screen
        name="weekly"
        options={{
          title: 'Vista Semanal',
        }}
      />
    </Stack>
  );
}
