import { IonIcon } from '@/components/IonIcon';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ExploreScreen() {
  const { user, services, bookAppointment } = useApp();
  const { colors } = useTheme();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    type: 'in-store' as 'online' | 'at-home' | 'in-store',
    notes: '',
  });

  const handleBookAppointment = () => {
    if (!selectedService || !bookingData.date || !bookingData.time) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    bookAppointment({
      clientId: user?.id || 'guest',
      serviceId: selectedService.id,
      date: bookingData.date,
      time: bookingData.time,
      status: 'pending',
      type: bookingData.type,
      notes: bookingData.notes,
      totalAmount: selectedService.price,
      paymentStatus: 'pending',
    });

    Alert.alert(
      '✅ Cita Reservada',
      `Tu cita para ${selectedService.name} ha sido reservada para el ${bookingData.date} a las ${bookingData.time}. Recibirás una confirmación pronto.`,
      [{ text: 'OK', onPress: () => {
        setShowBookingModal(false);
        setSelectedService(null);
        setBookingData({ date: '', time: '', type: 'in-store', notes: '' });
      }}]
    );
  };

  const getServiceTypeIcons = (service: any) => {
    const types = [];
    if (service.isOnline) types.push({ icon: 'laptop', text: 'Online' });
    if (service.isAtHome) types.push({ icon: 'home', text: 'A Domicilio' });
    if (service.isInStore) types.push({ icon: 'storefront', text: 'En Local' });
    return types;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      padding: 20,
      paddingTop: 60,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    headerText: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    headerSubtext: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 16,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    categoryFilter: {
      flexDirection: 'row',
      marginBottom: 20,
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    filterChipTextActive: {
      color: 'white',
    },
    serviceCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    serviceName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    serviceDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    serviceTypes: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    serviceTypeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.accent + '20',
    },
    serviceTypeText: {
      fontSize: 11,
      color: colors.accent,
      fontWeight: '500',
    },
    serviceFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    priceContainer: {
      flexDirection: 'column',
    },
    price: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
    },
    duration: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    bookButton: {
      backgroundColor: colors.accent,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    bookButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      margin: 20,
      width: '90%',
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      color: colors.text,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    typeSelector: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    typeOption: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    typeOptionActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    typeOptionText: {
      fontSize: 12,
      color: colors.text,
    },
    typeOptionTextActive: {
      color: 'white',
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    modalButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.secondary,
    },
    confirmButton: {
      backgroundColor: colors.primary,
    },
    modalButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const categories = ['Todos', ...Array.from(new Set(services.map(s => s.category)))];
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredServices = services.filter(service => 
    service.isActive && (selectedCategory === 'Todos' || service.category === selectedCategory)
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Servicios Disponibles</Text>
        <Text style={styles.headerSubtext}>Encuentra y reserva el servicio perfecto</Text>
      </View>

      <ScrollView style={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterChip,
                selectedCategory === category && styles.filterChipActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.filterChipText,
                selectedCategory === category && styles.filterChipTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredServices.map(service => (
          <View key={service.id} style={styles.serviceCard}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDescription}>{service.description}</Text>
            <View style={styles.serviceTypes}>
              {getServiceTypeIcons(service).map((type, index) => (
                <View key={index} style={styles.serviceTypeItem}>
                  <IonIcon name={type.icon as any} size={14} color={colors.accent} />
                  <Text style={styles.serviceTypeText}>{type.text}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.serviceFooter}>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>${service.price}</Text>
                <Text style={styles.duration}>{service.duration} min</Text>
              </View>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => {
                  setSelectedService(service);
                  setShowBookingModal(true);
                }}
              >
                <Text style={styles.bookButtonText}>Reservar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showBookingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reservar: {selectedService?.name}</Text>
            
            <Text style={styles.label}>Fecha (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2025-08-15"
              value={bookingData.date}
              onChangeText={(text) => setBookingData(prev => ({ ...prev, date: text }))}
            />

            <Text style={styles.label}>Hora (HH:MM)</Text>
            <TextInput
              style={styles.input}
              placeholder="14:30"
              value={bookingData.time}
              onChangeText={(text) => setBookingData(prev => ({ ...prev, time: text }))}
            />

            <Text style={styles.label}>Tipo de Servicio</Text>
            <View style={styles.typeSelector}>
              {selectedService?.isInStore && (
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    bookingData.type === 'in-store' && styles.typeOptionActive
                  ]}
                  onPress={() => setBookingData(prev => ({ ...prev, type: 'in-store' }))}
                >
                  <IonIcon 
                    name="storefront" 
                    size={16} 
                    color={bookingData.type === 'in-store' ? 'white' : colors.text} 
                  />
                  <Text style={[
                    styles.typeOptionText,
                    bookingData.type === 'in-store' && styles.typeOptionTextActive
                  ]}>En Local</Text>
                </TouchableOpacity>
              )}
              {selectedService?.isAtHome && (
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    bookingData.type === 'at-home' && styles.typeOptionActive
                  ]}
                  onPress={() => setBookingData(prev => ({ ...prev, type: 'at-home' }))}
                >
                  <IonIcon 
                    name="home" 
                    size={16} 
                    color={bookingData.type === 'at-home' ? 'white' : colors.text} 
                  />
                  <Text style={[
                    styles.typeOptionText,
                    bookingData.type === 'at-home' && styles.typeOptionTextActive
                  ]}>A Domicilio</Text>
                </TouchableOpacity>
              )}
              {selectedService?.isOnline && (
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    bookingData.type === 'online' && styles.typeOptionActive
                  ]}
                  onPress={() => setBookingData(prev => ({ ...prev, type: 'online' }))}
                >
                  <IonIcon 
                    name="laptop" 
                    size={16} 
                    color={bookingData.type === 'online' ? 'white' : colors.text} 
                  />
                  <Text style={[
                    styles.typeOptionText,
                    bookingData.type === 'online' && styles.typeOptionTextActive
                  ]}>Online</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>Notas (Opcional)</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Información adicional..."
              multiline
              value={bookingData.notes}
              onChangeText={(text) => setBookingData(prev => ({ ...prev, notes: text }))}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleBookAppointment}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
