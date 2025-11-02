import React from 'react';
import { IonIcon } from '@/components/IonIcon';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useClientDashboard } from '@/hooks/useClientDashboard';
import { router } from 'expo-router';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { getBrandId } from '@/utils/brandUtils';

export default function HomeScreen() {
  const { user, appointments, services, logout } = useApp();
  const { colors } = useTheme();
  
  // Hook para datos reales del dashboard (solo para clientes)
  const brandId = getBrandId();
  const dashboard = useClientDashboard({ 
    brandId, 
    autoRefreshInterval: 5 // Auto-refresh cada 5 minutos
  });

  if (!user) {
    router.replace('/(auth)');
    return null;
  }

  const handleLogout = React.useCallback(() => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            // Usar startTransition para evitar warnings
            React.startTransition(async () => {
              try {
                await logout();
                // Navegar después del logout
                router.replace('/(auth)');
              } catch (error) {
                console.error('Error en logout:', error);
                // Navegar aunque haya error
                router.replace('/(auth)');
              }
            });
          }
        }
      ]
    );
  }, [logout]);

  // Para admin: usar datos mock (mantenemos comportamiento actual)
  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today;
  });
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
  
  // Para cliente: usar datos reales del dashboard
  const isClient = user.role === 'client';
  const realStats = isClient && dashboard.data ? dashboard.data.stats : null;
  const realTodayAppointments = isClient && dashboard.data ? dashboard.data.todayAppointments : [];
  const realUpcomingAppointments = isClient && dashboard.data ? dashboard.data.recentAppointments : [];
  const realActiveServices = isClient && dashboard.data ? dashboard.data.availableServices : [];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      padding: 20,
      paddingTop: 60,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      elevation: 3,
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
    statsContainer: {
      flexDirection: 'row',
      marginBottom: 24,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    appointmentCard: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    appointmentTime: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    appointmentService: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    appointmentStatus: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      fontSize: 12,
      fontWeight: '500',
    },
    quickActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    actionButton: {
      flex: 1,
      backgroundColor: colors.accent,
      padding: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    actionButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    logoutButton: {
      backgroundColor: colors.error,
      padding: 12,
      borderRadius: 8,
      marginTop: 20,
      alignItems: 'center',
    },
    logoutButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return colors.success;
      case 'pending': return colors.warning;
      case 'cancelled': return colors.error;
      case 'completed': return colors.secondary;
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

  if (user.role === 'admin') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>¡Hola, {user.name}!</Text>
          <Text style={styles.headerSubtext}>{user.businessName || 'Panel de Administración'}</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{todayAppointments.length}</Text>
              <Text style={styles.statLabel}>Citas Hoy</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{pendingAppointments.length}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{services.filter(s => s.isActive).length}</Text>
              <Text style={styles.statLabel}>Servicios Activos</Text>
            </View>
          </View>

          <View style={styles.sectionTitleContainer}>
            <IonIcon name="calendar" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Citas de Hoy</Text>
          </View>
          {todayAppointments.length > 0 ? (
            todayAppointments.map(appointment => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <Text style={styles.appointmentTime}>{appointment.time}</Text>
                <Text style={styles.appointmentService}>
                  {services.find(s => s.id === appointment.serviceId)?.name}
                </Text>
                <Text style={[styles.appointmentStatus, {
                  backgroundColor: getStatusColor(appointment.status) + '20',
                  color: getStatusColor(appointment.status)
                }]}>
                  {getStatusText(appointment.status)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>
              No hay citas programadas para hoy
            </Text>
          )}

          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <IonIcon name="construct" size={16} color="white" />
              <Text style={styles.actionButtonText}>Servicios</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <IonIcon name="brush" size={16} color="white" />
              <Text style={styles.actionButtonText}>Personalizar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Vista para clientes - USANDO DATOS REALES DEL BACKEND
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>¡Hola, {dashboard.data?.profile.firstName || user.name}!</Text>
        <Text style={styles.headerSubtext}>
          {dashboard.loading ? 'Cargando...' : 'Gestiona tus citas'}
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={dashboard.refreshing}
            onRefresh={dashboard.refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {dashboard.loading && !dashboard.data ? (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 16 }}>
              Cargando datos del dashboard...
            </Text>
          </View>
        ) : dashboard.error ? (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <IonIcon name="warning" size={48} color={colors.error} />
            <Text style={{ color: colors.error, marginTop: 16, textAlign: 'center' }}>
              {dashboard.error}
            </Text>
            <TouchableOpacity 
              onPress={dashboard.reload}
              style={[styles.actionButton, { marginTop: 16, backgroundColor: colors.error }]}
            >
              <IonIcon name="refresh" size={16} color="white" />
              <Text style={styles.actionButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Estadísticas usando datos reales */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{realStats?.totalAppointments || 0}</Text>
                <Text style={styles.statLabel}>Mis Citas</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{realStats?.completedAppointments || 0}</Text>
                <Text style={styles.statLabel}>Completadas</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{realActiveServices.length}</Text>
                <Text style={styles.statLabel}>Servicios Disponibles</Text>
              </View>
            </View>

            {/* Citas de hoy usando datos reales */}
            <View style={styles.sectionTitleContainer}>
              <IonIcon name="today" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Citas de Hoy</Text>
            </View>
            {realTodayAppointments.length > 0 ? (
              realTodayAppointments.map(appointment => (
                <View key={appointment.id} style={styles.appointmentCard}>
                  <Text style={styles.appointmentTime}>{appointment.time}</Text>
                  <Text style={styles.appointmentService}>
                    {appointment.serviceType.name}
                  </Text>
                  <Text style={[styles.appointmentStatus, {
                    backgroundColor: getStatusColor(appointment.status.toLowerCase()) + '20',
                    color: getStatusColor(appointment.status.toLowerCase())
                  }]}>
                    {getStatusText(appointment.status.toLowerCase())}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: colors.textSecondary, fontStyle: 'italic', paddingHorizontal: 4 }}>
                No tienes citas programadas para hoy
              </Text>
            )}

            {/* Próximas citas usando datos reales */}
            <View style={styles.sectionTitleContainer}>
              <IonIcon name="clipboard" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Próximas Citas</Text>
            </View>
            {realUpcomingAppointments.length > 0 ? (
              realUpcomingAppointments.map(appointment => (
                <View key={appointment.id} style={styles.appointmentCard}>
                  <Text style={styles.appointmentTime}>{appointment.date} - {appointment.time}</Text>
                  <Text style={styles.appointmentService}>
                    {appointment.serviceType.name}
                  </Text>
                  {appointment.professional && (
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                      Profesional: {appointment.professional.name}
                    </Text>
                  )}
                  <Text style={[styles.appointmentStatus, {
                    backgroundColor: getStatusColor(appointment.status.toLowerCase()) + '20',
                    color: getStatusColor(appointment.status.toLowerCase())
                  }]}>
                    {getStatusText(appointment.status.toLowerCase())}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: colors.textSecondary, fontStyle: 'italic', paddingHorizontal: 4 }}>
                No tienes próximas citas programadas
              </Text>
            )}

            {/* Estadísticas adicionales */}
            <View style={[styles.statsContainer, { marginTop: 24 }]}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{realStats?.pendingAppointments || 0}</Text>
                <Text style={styles.statLabel}>Pendientes</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{realStats?.cancelledAppointments || 0}</Text>
                <Text style={styles.statLabel}>Canceladas</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
