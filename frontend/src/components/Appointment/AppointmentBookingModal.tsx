import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ServiceType, AppointmentFormData } from '@/api/types';
import { useAppointments } from '@/hooks/useAppointments';

interface AppointmentBookingModalProps {
  visible: boolean;
  onClose: () => void;
  service: ServiceType | null;
  onSuccess?: () => void;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  visible,
  onClose,
  service,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const {
    isCreatingAppointment,
    appointmentError,
    appointmentSuccess,
    createNewAppointment,
    clearMessages,
    generateTimeSlots,
    isValidAppointmentDate,
  } = useAppointments();

  const [formData, setFormData] = useState<AppointmentFormData>({
    selectedDate: null,
    selectedTime: null,
    notes: '',
    serviceTypeId: null,
  });

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (visible && service) {
      setFormData({
        selectedDate: null,
        selectedTime: null,
        notes: '',
        serviceTypeId: service.id,
      });
      clearMessages();
    }
  }, [visible, service]);

  // Manejar éxito
  useEffect(() => {
    if (appointmentSuccess) {
      Alert.alert(
        'Cita Creada',
        appointmentSuccess,
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess?.();
              onClose();
            },
          },
        ]
      );
    }
  }, [appointmentSuccess]);

  // Manejar errores
  useEffect(() => {
    if (appointmentError) {
      Alert.alert('Error', appointmentError);
    }
  }, [appointmentError]);

  const handleCreateAppointment = async () => {
    if (!service) return;

    const result = await createNewAppointment(formData, service);
    // El éxito se maneja en el useEffect de appointmentSuccess
  };

  // Generar fechas disponibles para los próximos 30 días
  const generateAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      if (isValidAppointmentDate(date)) {
        dates.push(date);
      }
    }
    
    return dates;
  };

  const availableDates = generateAvailableDates();
  const availableTimeSlots = formData.selectedDate ? generateTimeSlots(formData.selectedDate) : [];

  const isFormValid = () => {
    return formData.selectedDate && formData.selectedTime && formData.serviceTypeId;
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      width: '90%',
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E5E5',
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    closeButton: {
      padding: 8,
    },
    closeButtonText: {
      fontSize: 18,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    serviceInfo: {
      backgroundColor: colors.background || '#F8F9FA',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    serviceName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    serviceDetails: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    dateGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    dateButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E5E5E5',
      backgroundColor: colors.surface,
      minWidth: '30%',
      alignItems: 'center',
    },
    selectedDateButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    dateButtonText: {
      fontSize: 12,
      color: colors.text,
      textAlign: 'center',
    },
    selectedDateButtonText: {
      color: 'white',
      fontWeight: '600',
    },
    timeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    timeButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E5E5E5',
      backgroundColor: colors.surface,
      minWidth: 80,
      alignItems: 'center',
    },
    selectedTimeButton: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    timeButtonText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    selectedTimeButtonText: {
      color: 'white',
      fontWeight: '600',
    },
    notesInput: {
      borderWidth: 1,
      borderColor: '#E5E5E5',
      borderRadius: 8,
      padding: 12,
      minHeight: 80,
      textAlignVertical: 'top',
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    footer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#E5E5E5',
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    confirmButton: {
      flex: 2,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    confirmButtonEnabled: {
      backgroundColor: colors.primary,
    },
    confirmButtonDisabled: {
      backgroundColor: colors.textSecondary,
      opacity: 0.5,
    },
    confirmButtonText: {
      fontSize: 16,
      color: 'white',
      fontWeight: '700',
    },
    scrollContent: {
      maxHeight: 400,
    },
  });

  if (!service) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Reservar Cita</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Service Info */}
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDetails}>
                Duración: {service.duration} min • {service.price ? `$${service.price}` : 'Precio a consultar'}
              </Text>
            </View>

            {/* Date Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Seleccionar Fecha</Text>
              <View style={styles.dateGrid}>
                {availableDates.slice(0, 9).map((date, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateButton,
                      formData.selectedDate?.toDateString() === date.toDateString() && styles.selectedDateButton,
                    ]}
                    onPress={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        selectedDate: date,
                        selectedTime: null // Reset time when date changes
                      }));
                    }}
                  >
                    <Text style={[
                      styles.dateButtonText,
                      formData.selectedDate?.toDateString() === date.toDateString() && styles.selectedDateButtonText,
                    ]}>
                      {date.toLocaleDateString('es-ES', { 
                        month: 'short', 
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Selection */}
            {formData.selectedDate && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Seleccionar Hora</Text>
                <View style={styles.timeGrid}>
                  {availableTimeSlots.map((time, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeButton,
                        formData.selectedTime === time && styles.selectedTimeButton,
                      ]}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, selectedTime: time }));
                      }}
                    >
                      <Text style={[
                        styles.timeButtonText,
                        formData.selectedTime === time && styles.selectedTimeButtonText,
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notas (Opcional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Comentarios adicionales..."
                placeholderTextColor={colors.textSecondary}
                multiline
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.confirmButton,
                isFormValid() ? styles.confirmButtonEnabled : styles.confirmButtonDisabled,
              ]}
              onPress={handleCreateAppointment}
              disabled={!isFormValid() || isCreatingAppointment}
            >
              {isCreatingAppointment && <ActivityIndicator size="small" color="white" />}
              <Text style={styles.confirmButtonText}>
                {isCreatingAppointment ? 'Creando...' : 'Confirmar Cita'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};