// screens/ExploreScreen.tsx
import React from 'react';
import { View, StyleSheet, RefreshControl, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useExploreServices } from '@/hooks/useExploreServices';
import { ExploreHeader } from '@/components/Explore/ExploreHeader';
import { ServicesList } from '@/components/Explore/ServicesList';
import { ServiceType } from '@/api/types';

export default function ExploreScreen() {
  const { colors } = useTheme();
  const {
    services,
    isLoadingServices,
    error,
    refreshServices,
  } = useExploreServices();

  const handleServicePress = (service: ServiceType) => {
    console.log('Service selected:', service);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      color: colors.error,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <ExploreHeader
        title="Servicios Disponibles"
        subtitle="Encuentra el servicio perfecto"
      />

      <View style={styles.content}>
        {error ? (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={isLoadingServices}
                onRefresh={refreshServices}
                colors={[colors.primary]}
              />
            }
          >
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={refreshServices}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <ServicesList
            services={services}
            onServicePress={handleServicePress}
            isLoading={isLoadingServices}
          />
        )}
      </View>
    </View>
  );
}