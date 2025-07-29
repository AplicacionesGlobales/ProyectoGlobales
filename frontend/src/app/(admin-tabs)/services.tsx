import { Service, useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ServicesManagementScreen() {
  const { user, services, addService, updateService, deleteService } = useApp();
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceData, setServiceData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    isActive: true,
    isOnline: false,
    isAtHome: false,
    isInStore: true,
  });

  if (!user || user.role !== 'admin') {
    router.push('/' as any);
    return null;
  }

  const handleAddService = () => {
    setEditingService(null);
    setServiceData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: '',
      isActive: true,
      isOnline: false,
      isAtHome: false,
      isInStore: true,
    });
    setShowModal(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
      isActive: service.isActive,
      isOnline: service.isOnline,
      isAtHome: service.isAtHome,
      isInStore: service.isInStore,
    });
    setShowModal(true);
  };

  const handleSaveService = () => {
    if (!serviceData.name || !serviceData.description || !serviceData.price || !serviceData.duration || !serviceData.category) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    const serviceToSave = {
      name: serviceData.name,
      description: serviceData.description,
      price: parseFloat(serviceData.price),
      duration: parseInt(serviceData.duration),
      category: serviceData.category,
      isActive: serviceData.isActive,
      isOnline: serviceData.isOnline,
      isAtHome: serviceData.isAtHome,
      isInStore: serviceData.isInStore,
    };

    if (editingService) {
      updateService(editingService.id, serviceToSave);
      Alert.alert('✅ Servicio Actualizado', 'El servicio ha sido actualizado correctamente');
    } else {
      addService(serviceToSave);
      Alert.alert('✅ Servicio Creado', 'El nuevo servicio ha sido creado correctamente');
    }

    setShowModal(false);
  };

  const handleDeleteService = (service: Service) => {
    Alert.alert(
      'Eliminar Servicio',
      `¿Estás seguro que deseas eliminar "${service.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: () => {
            deleteService(service.id);
            Alert.alert('🗑️ Servicio Eliminado', 'El servicio ha sido eliminado correctamente');
          }
        }
      ]
    );
  };

  const toggleServiceStatus = (service: Service) => {
    updateService(service.id, { isActive: !service.isActive });
  };

  const getServiceTypeIcons = (service: Service) => {
    const types = [];
    if (service.isOnline) types.push('💻');
    if (service.isAtHome) types.push('🏠');
    if (service.isInStore) types.push('🏪');
    return types.join(' ');
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
    backButton: {
      marginBottom: 16,
    },
    backButtonText: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 16,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    addButton: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 20,
    },
    addButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    serviceCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    serviceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    serviceName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
    },
    serviceStatus: {
      fontSize: 12,
      fontWeight: '500',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    activeStatus: {
      backgroundColor: colors.success + '20',
      color: colors.success,
    },
    inactiveStatus: {
      backgroundColor: colors.error + '20',
      color: colors.error,
    },
    serviceDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    serviceInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    priceInfo: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primary,
    },
    durationInfo: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    serviceTypes: {
      fontSize: 16,
      marginBottom: 12,
    },
    serviceActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flex: 1,
      padding: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
    editButton: {
      backgroundColor: colors.secondary,
    },
    toggleButton: {
      backgroundColor: colors.accent,
    },
    deleteButton: {
      backgroundColor: colors.error,
    },
    actionButtonText: {
      color: 'white',
      fontSize: 12,
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
      maxHeight: '90%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
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
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingVertical: 8,
    },
    switchLabel: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
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
    saveButton: {
      backgroundColor: colors.primary,
    },
    modalButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Gestión de Servicios</Text>
        <Text style={styles.headerSubtext}>Administra tus servicios y precios</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddService}>
          <Text style={styles.addButtonText}>➕ Agregar Nuevo Servicio</Text>
        </TouchableOpacity>

        {services.map(service => (
          <View key={service.id} style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={[
                styles.serviceStatus,
                service.isActive ? styles.activeStatus : styles.inactiveStatus
              ]}>
                {service.isActive ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
            
            <Text style={styles.serviceDescription}>{service.description}</Text>
            
            <View style={styles.serviceInfo}>
              <View>
                <Text style={styles.priceInfo}>${service.price}</Text>
                <Text style={styles.durationInfo}>{service.duration} minutos</Text>
              </View>
              <Text style={styles.durationInfo}>{service.category}</Text>
            </View>
            
            <Text style={styles.serviceTypes}>
              Disponible: {getServiceTypeIcons(service)}
            </Text>
            
            <View style={styles.serviceActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditService(service)}
              >
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.toggleButton]}
                onPress={() => toggleServiceStatus(service)}
              >
                <Text style={styles.actionButtonText}>
                  {service.isActive ? 'Desactivar' : 'Activar'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteService(service)}
              >
                <Text style={styles.actionButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
              </Text>
              
              <Text style={styles.label}>Nombre del Servicio</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Sesión de Fotos"
                value={serviceData.name}
                onChangeText={(text) => setServiceData(prev => ({ ...prev, name: text }))}
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe tu servicio..."
                multiline
                value={serviceData.description}
                onChangeText={(text) => setServiceData(prev => ({ ...prev, description: text }))}
              />

              <Text style={styles.label}>Precio ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="150"
                keyboardType="numeric"
                value={serviceData.price}
                onChangeText={(text) => setServiceData(prev => ({ ...prev, price: text }))}
              />

              <Text style={styles.label}>Duración (minutos)</Text>
              <TextInput
                style={styles.input}
                placeholder="60"
                keyboardType="numeric"
                value={serviceData.duration}
                onChangeText={(text) => setServiceData(prev => ({ ...prev, duration: text }))}
              />

              <Text style={styles.label}>Categoría</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Fotografía, Belleza, Salud"
                value={serviceData.category}
                onChangeText={(text) => setServiceData(prev => ({ ...prev, category: text }))}
              />

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>💻 Disponible Online</Text>
                <Switch
                  value={serviceData.isOnline}
                  onValueChange={(value) => setServiceData(prev => ({ ...prev, isOnline: value }))}
                  trackColor={{ false: '#E2E8F0', true: colors.primary }}
                />
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>🏠 Servicio a Domicilio</Text>
                <Switch
                  value={serviceData.isAtHome}
                  onValueChange={(value) => setServiceData(prev => ({ ...prev, isAtHome: value }))}
                  trackColor={{ false: '#E2E8F0', true: colors.primary }}
                />
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>🏪 En Local/Consultorio</Text>
                <Switch
                  value={serviceData.isInStore}
                  onValueChange={(value) => setServiceData(prev => ({ ...prev, isInStore: value }))}
                  trackColor={{ false: '#E2E8F0', true: colors.primary }}
                />
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>✅ Servicio Activo</Text>
                <Switch
                  value={serviceData.isActive}
                  onValueChange={(value) => setServiceData(prev => ({ ...prev, isActive: value }))}
                  trackColor={{ false: '#E2E8F0', true: colors.primary }}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveService}
                >
                  <Text style={styles.modalButtonText}>
                    {editingService ? 'Actualizar' : 'Crear'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
