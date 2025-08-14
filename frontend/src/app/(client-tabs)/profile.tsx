import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import React from 'react';
import { 
  Alert, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);

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
    <StyledView style={styles.container}>
      <StyledView style={styles.header}>
        <StyledText style={styles.headerText}>Mi Perfil</StyledText>
        <StyledText style={styles.headerSubtext}>Información de tu cuenta</StyledText>
      </StyledView>

      <StyledScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información del perfil */}
        <StyledView style={styles.profileCard}>
          <StyledView style={styles.sectionTitleContainer}>
            <Ionicons name="person" size={20} color={colors.primary} />
            <StyledText style={styles.sectionTitle}>Información Personal</StyledText>
          </StyledView>
          
          <StyledView style={styles.profileInfo}>
            <StyledText style={styles.label}>Nombre completo</StyledText>
            <StyledText style={styles.value}>{user.name}</StyledText>
          </StyledView>

          <StyledView style={styles.profileInfo}>
            <StyledText style={styles.label}>Correo electrónico</StyledText>
            <StyledText style={styles.value}>{user.email}</StyledText>
          </StyledView>

          <StyledView style={styles.profileInfo}>
            <StyledText style={styles.label}>Tipo de cuenta</StyledText>
            <StyledText style={styles.value}>Cliente</StyledText>
          </StyledView>
        </StyledView>

        {/* Estadísticas */}
        <StyledView style={styles.statsContainer}>
          <StyledView style={styles.statCard}>
            <StyledText style={styles.statNumber}>{myAppointments.length}</StyledText>
            <StyledText style={styles.statLabel}>Citas Totales</StyledText>
          </StyledView>
          
          <StyledView style={styles.statCard}>
            <StyledText style={styles.statNumber}>{completedAppointments.length}</StyledText>
            <StyledText style={styles.statLabel}>Completadas</StyledText>
          </StyledView>
          
          <StyledView style={styles.statCard}>
            <StyledText style={styles.statNumber}>${totalSpent.toFixed(2)}</StyledText>
            <StyledText style={styles.statLabel}>Total Gastado</StyledText>
          </StyledView>
        </StyledView>

        {/* Opciones */}
        <StyledView style={styles.sectionTitleContainer}>
          <Ionicons name="settings" size={20} color={colors.primary} />
          <StyledText style={styles.sectionTitle}>Configuración</StyledText>
        </StyledView>
        
        <StyledTouchableOpacity style={styles.optionCard}>
          <StyledText style={styles.optionText}>Mis Citas</StyledText>
          <Ionicons name="finger-print" size={18} color={colors.textSecondary} />
        </StyledTouchableOpacity>

        <StyledTouchableOpacity style={styles.optionCard}>
          <StyledText style={styles.optionText}>Historial de Pagos</StyledText>
          <Ionicons name="card" size={18} color={colors.textSecondary} />
        </StyledTouchableOpacity>

        <StyledTouchableOpacity style={styles.optionCard}>
          <StyledText style={styles.optionText}>Notificaciones</StyledText>
          <Ionicons name="notifications" size={18} color={colors.textSecondary} />
        </StyledTouchableOpacity>

        <StyledTouchableOpacity style={styles.optionCard}>
          <StyledText style={styles.optionText}>Ayuda y Soporte</StyledText>
          <Ionicons name="help-circle" size={18} color={colors.textSecondary} />
        </StyledTouchableOpacity>

        {/* Botón de logout */}
        <StyledTouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={18} color="white" />
          <StyledText style={styles.logoutButtonText}>Cerrar Sesión</StyledText>
        </StyledTouchableOpacity>
      </StyledScrollView>
    </StyledView>
  );
}