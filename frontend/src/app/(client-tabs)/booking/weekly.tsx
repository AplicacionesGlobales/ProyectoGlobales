// src/app/(client-tabs)/booking/weekly.tsx
// Vista semanal del calendario - Página separada para navegación futura

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WeeklyCalendarScreen() {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'stretch',
      paddingVertical: 16,
      paddingHorizontal: 20,
      paddingTop: 60,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.textSecondary + '30',
    },
    backButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.textSecondary + '20',
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 16,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    message: {
      fontSize: 18,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Vista Semanal</Text>
      </View>

      <View style={styles.content}>
        <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.message}>
          Vista Semanal en Desarrollo
        </Text>
        <Text style={styles.description}>
          Esta funcionalidad estará disponible próximamente.{'\n'}
          Por ahora, puedes usar la vista diaria para gestionar tus citas.
        </Text>
      </View>
    </View>
  );
}
