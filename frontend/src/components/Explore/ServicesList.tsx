import React from 'react';
import { ScrollView, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ServiceCard } from './ServiceCard';
import { ServiceType } from '@/api/types';

interface ServicesListProps {
  services: ServiceType[];
  onServicePress?: (service: ServiceType) => void;
  isLoading?: boolean;
}

export const ServicesList: React.FC<ServicesListProps> = ({
  services,
  onServicePress,
  isLoading = false,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      marginTop: 10,
      color: colors.textSecondary,
      fontSize: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 16,
      textAlign: 'center',
    },
    scrollContent: {
      paddingBottom: 20,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando servicios...</Text>
      </View>
    );
  }

  if (services.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No hay servicios disponibles en este momento
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {services.map(service => (
        <ServiceCard
          key={service.id}
          service={service}
          onPress={onServicePress}
        />
      ))}
    </ScrollView>
  );
};