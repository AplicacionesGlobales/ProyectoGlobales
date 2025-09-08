import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ServiceType } from '@/api/types';
import { AppointmentBookingModal } from '@/components/Appointment/AppointmentBookingModal';

interface ServiceCardProps {
  service: ServiceType;
  onPress?: (service: ServiceType) => void;
  onAppointmentSuccess?: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onPress,
  onAppointmentSuccess 
}) => {
  const { colors } = useTheme();
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatear duración
  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h ${remainingMinutes}min`
        : `${hours}h`;
    }
    return `${minutes} min`;
  };

  const styles = StyleSheet.create({
    serviceCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
      position: 'relative',
    },
    colorIndicator: {
      width: 6,
      height: '100%',
      position: 'absolute',
      left: 0,
      top: 0,
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    titleSection: {
      flex: 1,
      marginRight: 12,
    },
    serviceName: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
      lineHeight: 24,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    activeBadge: {
      backgroundColor: '#E8F5E8',
    },
    inactiveBadge: {
      backgroundColor: '#FFF3E0',
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    activeText: {
      color: '#2E7D32',
    },
    inactiveText: {
      color: '#F57C00',
    },
    serviceDescription: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
      fontStyle: service.description ? 'normal' : 'italic',
    },
    detailsSection: {
      marginBottom: 16,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    detailLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    priceValue: {
      fontSize: 18,
      color: colors.primary,
      fontWeight: '700',
    },
    noPriceValue: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    durationValue: {
      fontSize: 16,
      color: colors.accent,
      fontWeight: '600',
    },
    serviceFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
      gap: 8,
    },
    actionButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 10,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
      alignItems: 'center',
    },
    bookButton: {
      flex: 1,
      backgroundColor: colors.accent,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 10,
      shadowColor: colors.accent,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
      alignItems: 'center',
    },
    actionButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'center',
    },
  });

  return (
    <>
      <TouchableOpacity 
        style={styles.serviceCard}
        onPress={() => onPress?.(service)}
        activeOpacity={0.7}
      >
        {/* Color Indicator */}
        {service.color && (
          <View 
            style={[
              styles.colorIndicator, 
              { backgroundColor: service.color }
            ]} 
          />
        )}

        {/* Header Section */}
        <View style={styles.cardHeader}>
          <View style={styles.titleSection}>
            <Text style={styles.serviceName}>{service.name}</Text>
          </View>
          
          <View style={[
            styles.statusBadge,
            service.isActive ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <Text style={[
              styles.statusText,
              service.isActive ? styles.activeText : styles.inactiveText
            ]}>
              {service.isActive ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.serviceDescription}>
          {service.description || 'Sin descripción disponible'}
        </Text>

        {/* Service Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Precio</Text>
            {service.price ? (
              <Text style={styles.priceValue}>${service.price}</Text>
            ) : (
              <Text style={styles.noPriceValue}>A consultar</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duración</Text>
            <Text style={styles.durationValue}>
              {formatDuration(service.duration)}
            </Text>
          </View>
        </View>

        {/* Footer with Action Buttons */}
        <View style={styles.serviceFooter}>         
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => setShowBookingModal(true)}
          >
            <Text style={styles.actionButtonText}>Reservar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Booking Modal */}
      <AppointmentBookingModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        service={service}
        onSuccess={() => {
          setShowBookingModal(false);
          onAppointmentSuccess?.();
        }}
      />
    </>
  );
};