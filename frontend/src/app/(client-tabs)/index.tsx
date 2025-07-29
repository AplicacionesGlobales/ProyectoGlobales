import { IonIcon } from '@/components/IonIcon';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { user, appointments, services, logout } = useApp();
  const { colors } = useTheme();

  if (!user) {
    router.replace('/(auth)');
    return null;
  }

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

  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today;
  });

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');

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

  // Vista para clientes
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>¡Hola, {user.name}!</Text>
        <Text style={styles.headerSubtext}>Gestiona tus citas</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{appointments.filter(a => a.clientId === user.id).length}</Text>
            <Text style={styles.statLabel}>Mis Citas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{confirmedAppointments.filter(a => a.clientId === user.id).length}</Text>
            <Text style={styles.statLabel}>Confirmadas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{services.filter(s => s.isActive).length}</Text>
            <Text style={styles.statLabel}>Servicios Disponibles</Text>
          </View>
        </View>

        <View style={styles.sectionTitleContainer}>
          <IonIcon name="clipboard" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Mis Próximas Citas</Text>
        </View>
        {appointments.filter(a => a.clientId === user.id).map(appointment => (
          <View key={appointment.id} style={styles.appointmentCard}>
            <Text style={styles.appointmentTime}>{appointment.date} - {appointment.time}</Text>
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
        ))}

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('./explore')}>
            <IonIcon name="calendar" size={16} color="white" />
            <Text style={styles.actionButtonText}>Reservar Cita</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
