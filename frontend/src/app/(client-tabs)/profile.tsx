import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '@/services/authService';
import {
  ProfileHeader,
  ProfileSection,
  ProfileListItem,
  EditProfileModal,
} from '@/components/Profile';
import {
  ClientProfile,
  EditProfileData,
  ProfileStats,
  RecentAppointment,
} from '@/types/profile.types';
import { ClientHistoryView } from '@/components/History';

export default function ProfileScreen() {
  const { user, logout, appointments } = useApp();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    totalAppointments: 0,
    completedAppointments: 0,
    totalSpent: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar autenticación
  if (!user) {
    router.replace('/(auth)');
    return null;
  }

  // Cargar datos del perfil
  const loadProfileData = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser();

      if (userData?.user) {
        const profileData: ClientProfile = {
          id: userData.user.id,
          firstName: userData.user.firstName || user.name.split(' ')[0] || '',
          lastName: userData.user.lastName || user.name.split(' ')[1] || '',
          email: userData.user.email || user.email || '',
          phone: userData.user.phone || '',
          notes: userData.user.notes || '',
          avatar: userData.user.avatar || undefined,
          memberSince: userData.user.createdAt || new Date().toISOString(),
          isActive: userData.user.isActive ?? true,
          role: userData.user.role || 'client',
        };

        setProfile(profileData);
      }

      // Calcular estadísticas basadas en las citas del usuario
      const myAppointments = appointments.filter(apt => apt.clientId === user.id);
      const completedAppointments = myAppointments.filter(apt => apt.status === 'completed');
      const totalSpent = completedAppointments.reduce((sum, apt) => sum + apt.totalAmount, 0);

      setStats({
        totalAppointments: myAppointments.length,
        completedAppointments: completedAppointments.length,
        totalSpent: totalSpent,
      });

      // Obtener citas recientes (últimas 3 completadas)
      const recentCompleted = completedAppointments
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
        .map(apt => ({
          id: apt.id,
          serviceName: `Servicio ${apt.serviceId}`, // Usar serviceId como nombre del servicio por ahora
          date: apt.date,
          time: apt.time,
          status: apt.status as 'pending' | 'confirmed' | 'cancelled' | 'completed',
          amount: apt.totalAmount,
        }));

      setRecentAppointments(recentCompleted);
    } catch (error) {
      console.error('Error cargando datos del perfil:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  }, [user, appointments]);

  // Cargar datos al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  // Manejar actualización del perfil
  const handleUpdateProfile = async (data: EditProfileData) => {
    try {
      await authService.updateProfile(data);

      // Actualizar el estado local del perfil
      if (profile) {
        setProfile({
          ...profile,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          notes: data.notes,
        });
      }

      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error; // Re-lanzar para que el modal maneje el error
    }
  };

  // Manejar logout
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
          },
        },
      ]
    );
  };

  // Manejar configuraciones
  const handleSettings = () => {
    Alert.alert('Configuraciones', 'Próximamente disponible');
  };

  // Manejar notificaciones
  const handleNotifications = () => {
    Alert.alert('Notificaciones', 'Próximamente disponible');
  };

  // Manejar privacidad
  const handlePrivacy = () => {
    Alert.alert('Privacidad', 'Próximamente disponible');
  };

  // Manejar ayuda
  const handleHelp = () => {
    Alert.alert('Ayuda', 'Próximamente disponible');
  };

  // Manejar historial completo
  const handleFullHistory = () => {
    router.push('./history');
  };

  // Manejar historial de pagos
  const handlePaymentHistory = () => {
    Alert.alert('Historial de Pagos', 'Próximamente disponible');
  };

  // Manejar mis citas
  const handleMyAppointments = () => {
    Alert.alert('Mis Citas', 'Funcionalidad próximamente disponible');
  };

  // Manejar refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  }, [loadProfileData]);

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header del perfil */}
        <ProfileHeader
          profile={profile}
          onEdit={() => setShowEditModal(true)}
          onSettings={handleSettings}
        />

        {/* Estadísticas */}
        <ProfileSection title="Estadísticas">
          <ProfileListItem
            icon="calendar-outline"
            title="Citas Totales"
            subtitle={`${stats.totalAppointments} citas`}
            showArrow={false}
          />
          <ProfileListItem
            icon="checkmark-circle-outline"
            title="Citas Completadas"
            subtitle={`${stats.completedAppointments} completadas`}
            showArrow={false}
          />
          <ProfileListItem
            icon="card-outline"
            title="Total Gastado"
            subtitle={formatCurrency(stats.totalSpent)}
            showArrow={false}
            isLast
          />
        </ProfileSection>

        {/* Citas Recientes */}
        <ProfileSection title="Citas Recientes">
          {recentAppointments.length > 0 ? (
            recentAppointments.map((appointment, index) => (
              <ProfileListItem
                key={appointment.id}
                icon="time-outline"
                title={appointment.serviceName}
                subtitle={`${appointment.date} - ${formatCurrency(appointment.amount)}`}
                onPress={() => {
                  Alert.alert('Cita', `Detalles de ${appointment.serviceName}`);
                }}
                isLast={index === recentAppointments.length - 1}
              />
            ))
          ) : (
            <ProfileListItem
              icon="calendar-outline"
              title="No hay citas recientes"
              subtitle="Agenda tu primera cita"
              showArrow={false}
              isLast
            />
          )}
        </ProfileSection>

        {/* Historial Completo */}
        <ProfileSection title="Historial Reciente">
          <ClientHistoryView
            showTitle={false}
            maxItems={5}
            onSeeAll={handleFullHistory}
          />
        </ProfileSection>

        {/* Configuración */}
        <ProfileSection title="Configuración">
          <ProfileListItem
            icon="calendar"
            title="Mis Citas"
            onPress={handleMyAppointments}
          />
          <ProfileListItem
            icon="card"
            title="Historial de Pagos"
            onPress={handlePaymentHistory}
          />
          <ProfileListItem
            icon="notifications-outline"
            title="Notificaciones"
            onPress={handleNotifications}
          />
          <ProfileListItem
            icon="shield-outline"
            title="Privacidad y Seguridad"
            onPress={handlePrivacy}
          />
          <ProfileListItem
            icon="help-circle-outline"
            title="Ayuda y Soporte"
            onPress={handleHelp}
          />
          <ProfileListItem
            icon="log-out-outline"
            title="Cerrar Sesión"
            onPress={handleLogout}
            showArrow={false}
            isLast
          />
        </ProfileSection>

        {/* Espacio inferior */}
        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Modal de edición */}
      <EditProfileModal
        visible={showEditModal}
        profile={profile}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateProfile}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  bottomSpace: {
    height: 32,
  },
});