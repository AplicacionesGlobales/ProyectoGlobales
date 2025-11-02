// components/Appointments/AppointmentStats.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { AppointmentSummary } from '../../types/appointments.types';

interface AppointmentStatsProps {
  summary: AppointmentSummary;
  style?: any;
}

export const AppointmentStats: React.FC<AppointmentStatsProps> = ({
  summary,
  style,
}) => {
  const { colors } = useTheme();

  const statsConfig = [
    {
      id: 'total',
      label: 'Total de Citas',
      value: summary.totalAppointments,
      icon: 'calendar-outline',
      color: colors.primary,
      backgroundColor: colors.primary + '15',
    },
    {
      id: 'completed',
      label: 'Completadas',
      value: summary.completedAppointments,
      icon: 'checkmark-circle-outline',
      color: '#10B981', // green-500
      backgroundColor: '#10B981' + '15',
    },
    {
      id: 'pending',
      label: 'Pendientes',
      value: summary.pendingAppointments,
      icon: 'time-outline',
      color: '#F59E0B', // amber-500
      backgroundColor: '#F59E0B' + '15',
    },
    {
      id: 'cancelled',
      label: 'Canceladas',
      value: summary.cancelledAppointments,
      icon: 'close-circle-outline',
      color: '#EF4444', // red-500
      backgroundColor: '#EF4444' + '15',
    },
  ];

  const renderStatItem = (stat: typeof statsConfig[0]) => (
    <View key={stat.id} style={[styles.statItem, { backgroundColor: stat.backgroundColor }]}>
      <View style={styles.statIconContainer}>
        <Ionicons 
          name={stat.icon as any} 
          size={20} 
          color={stat.color} 
        />
      </View>
      
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: stat.color }]}>
          {stat.value}
        </Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
          {stat.label}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Resumen de Citas
      </Text>
      
      <View style={styles.statsGrid}>
        {statsConfig.map(renderStatItem)}
      </View>
      
      {/* Estadística destacada */}
      {summary.totalAppointments > 0 && (
        <View style={[styles.highlightStat, { backgroundColor: colors.surface }]}>
          <View style={styles.highlightContent}>
            <Ionicons 
              name="trending-up" 
              size={24} 
              color={colors.success} 
            />
            <View style={styles.highlightText}>
              <Text style={[styles.highlightValue, { color: colors.text }]}>
                {Math.round((summary.completedAppointments / summary.totalAppointments) * 100)}%
              </Text>
              <Text style={[styles.highlightLabel, { color: colors.textSecondary }]}>
                Tasa de finalización
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  highlightStat: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  highlightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightText: {
    marginLeft: 12,
  },
  highlightValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  highlightLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});