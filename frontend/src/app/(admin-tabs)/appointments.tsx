import { Appointment, useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AppointmentsManagementScreen() {
  const { user, appointments, services, clients, updateAppointment, cancelAppointment, logout } = useApp();
  const { colors } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');

  if (!user || user.role !== 'admin') {
    router.push('/' as any);
    return null;
  }

  const filteredAppointments = appointments.filter(appointment => {
    const service = services.find(s => s.id === appointment.serviceId);
    const client = clients.find(c => c.id === appointment.clientId);
    
    const matchesSearch = !searchTerm || 
      service?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.date.includes(searchTerm) ||
      appointment.time.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    updateAppointment(appointmentId, { status: newStatus });
    Alert.alert('✅ Estado Actualizado', 'El estado de la cita ha sido actualizada');
  };

  const handleCancel = (appointmentId: string) => {
    Alert.alert(
      'Cancelar Cita',
      '¿Estás seguro que deseas cancelar esta cita?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Sí, Cancelar', 
          style: 'destructive', 
          onPress: () => {
            cancelAppointment(appointmentId);
            Alert.alert('❌ Cita Cancelada', 'La cita ha sido cancelada');
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive', 
          onPress: () => {
            logout();
            // Forzar navegación a auth después del logout
            setTimeout(() => {
              router.replace('/(auth)');
            }, 100);
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return colors.success;
      case 'pending': return colors.warning;
      case 'cancelled': return colors.error;
      case 'completed': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'online': return '💻';
      case 'at-home': return '🏠';
      case 'in-store': return '🏪';
      default: return '📍';
    }
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
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    logoutButton: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoutButtonText: {
      color: 'white',
      fontSize: 18,
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
    searchInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      color: colors.text,
    },
    filterContainer: {
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
      fontSize: 12,
      fontWeight: '500',
    },
    filterChipTextActive: {
      color: 'white',
    },
    appointmentCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    appointmentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    appointmentDate: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    appointmentStatus: {
      fontSize: 12,
      fontWeight: '500',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    clientInfo: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    serviceInfo: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
      marginBottom: 8,
    },
    appointmentDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    typeAndPrice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    typeInfo: {
      fontSize: 14,
      color: colors.accent,
    },
    priceInfo: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primary,
    },
    notes: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginBottom: 12,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flex: 1,
      padding: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
    confirmButton: {
      backgroundColor: colors.success,
    },
    completeButton: {
      backgroundColor: colors.primary,
    },
    cancelButton: {
      backgroundColor: colors.error,
    },
    actionButtonText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    emptyState: {
      textAlign: 'center',
      color: colors.textSecondary,
      fontSize: 16,
      marginTop: 40,
      fontStyle: 'italic',
    },
    statsRow: {
      flexDirection: 'row',
      marginBottom: 20,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  const statusCounts = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerText}>Gestión de Citas</Text>
            <Text style={styles.headerSubtext}>Administra todas las citas de tu negocio</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{statusCounts.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{statusCounts.pending}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{statusCounts.confirmed}</Text>
            <Text style={styles.statLabel}>Confirmadas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{statusCounts.completed}</Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cliente, servicio, fecha..."
          placeholderTextColor={colors.textSecondary}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                filterStatus === status && styles.filterChipActive
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[
                styles.filterChipText,
                filterStatus === status && styles.filterChipTextActive
              ]}>
                {status === 'all' ? 'Todas' : getStatusText(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredAppointments.length === 0 ? (
          <Text style={styles.emptyState}>
            No se encontraron citas con los filtros seleccionados
          </Text>
        ) : (
          filteredAppointments.map(appointment => {
            const service = services.find(s => s.id === appointment.serviceId);
            const client = clients.find(c => c.id === appointment.clientId);
            
            return (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <View>
                    <Text style={styles.appointmentDate}>
                      {appointment.date} - {appointment.time}
                    </Text>
                    <Text style={styles.clientInfo}>
                      Cliente: {client?.name || 'Cliente desconocido'}
                    </Text>
                  </View>
                  <Text style={[
                    styles.appointmentStatus,
                    { 
                      backgroundColor: getStatusColor(appointment.status) + '20',
                      color: getStatusColor(appointment.status)
                    }
                  ]}>
                    {getStatusText(appointment.status)}
                  </Text>
                </View>

                <Text style={styles.serviceInfo}>
                  {service?.name || 'Servicio no encontrado'}
                </Text>

                <View style={styles.appointmentDetails}>
                  <View style={styles.typeAndPrice}>
                    <Text style={styles.typeInfo}>
                      {getTypeIcon(appointment.type)} {appointment.type === 'online' ? 'Online' : 
                       appointment.type === 'at-home' ? 'A Domicilio' : 'En Local'}
                    </Text>
                    <Text style={styles.priceInfo}>${appointment.totalAmount}</Text>
                  </View>
                </View>

                {appointment.notes && (
                  <Text style={styles.notes}>Notas: {appointment.notes}</Text>
                )}

                {appointment.status === 'pending' && (
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.confirmButton]}
                      onPress={() => handleStatusChange(appointment.id, 'confirmed')}
                    >
                      <Text style={styles.actionButtonText}>Confirmar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={() => handleCancel(appointment.id)}
                    >
                      <Text style={styles.actionButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {appointment.status === 'confirmed' && (
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.completeButton]}
                      onPress={() => handleStatusChange(appointment.id, 'completed')}
                    >
                      <Text style={styles.actionButtonText}>Marcar Completada</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={() => handleCancel(appointment.id)}
                    >
                      <Text style={styles.actionButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
