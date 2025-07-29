import { IonIcon } from '@/components/IonIcon';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { user, logout, appointments } = useApp();
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

  const myAppointments = appointments.filter(apt => apt.clientId === user.id);
  const completedAppointments = myAppointments.filter(apt => apt.status === 'completed');
  const totalSpent = completedAppointments.reduce((sum, apt) => sum + apt.totalAmount, 0);

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
    profileCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      elevation: 2,
    },
    profileInfo: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    value: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
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
      fontSize: 20,
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
      fontSize: 18,
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
    logoutButton: {
      backgroundColor: '#EF4444',
      borderRadius: 8,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 20,
      elevation: 2,
    },
    logoutButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    optionCard: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    optionText: {
      fontSize: 16,
      color: colors.text,
    },
    optionIcon: {
      fontSize: 18,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Mi Perfil</Text>
        <Text style={styles.headerSubtext}>Información de tu cuenta</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información del perfil */}
        <View style={styles.profileCard}>
          <View style={styles.sectionTitleContainer}>
            <IonIcon name="person" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Información Personal</Text>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.label}>Nombre completo</Text>
            <Text style={styles.value}>{user.name}</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.label}>Correo electrónico</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.label}>Tipo de cuenta</Text>
            <Text style={styles.value}>Cliente</Text>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{myAppointments.length}</Text>
            <Text style={styles.statLabel}>Citas Totales</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedAppointments.length}</Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>${totalSpent.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Gastado</Text>
          </View>
        </View>

        {/* Opciones */}
        <View style={styles.sectionTitleContainer}>
          <IonIcon name="settings" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Configuración</Text>
        </View>
        
        <TouchableOpacity style={styles.optionCard}>
          <Text style={styles.optionText}>Mis Citas</Text>
          <IonIcon name="finger-print" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionCard}>
          <Text style={styles.optionText}>Historial de Pagos</Text>
          <IonIcon name="card" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionCard}>
          <Text style={styles.optionText}>Notificaciones</Text>
          <IonIcon name="notifications" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionCard}>
          <Text style={styles.optionText}>Ayuda y Soporte</Text>
          <IonIcon name="help-circle" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Botón de logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <IonIcon name="log-out" size={18} color="white" />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
