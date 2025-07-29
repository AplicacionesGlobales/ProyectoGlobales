import { healthCheck } from '@/api';
import { IonIcon } from '@/components/IonIcon';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const { colors } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        // Navigation success, navigate based on email
        const isAdmin = email === 'admin@test.com';
        
        // Use setTimeout to ensure state is updated before navigation
        setTimeout(() => {
          try {
            if (isAdmin) {
              // Navigate to admin tabs
              router.replace('/(admin-tabs)/appointments');
            } else {
              // Navigate to client tabs  
              router.replace('/(client-tabs)');
            }
          } catch (error) {
            console.log('Navigation error:', error);
            // Fallback navigation
            router.replace('/');
          }
        }, 100);
      } else {
        Alert.alert('Error', 'Credenciales incorrectas');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (type: 'admin' | 'client') => {
    if (type === 'admin') {
      setEmail('admin@test.com');
      setPassword('admin123');
    } else {
      setEmail('client@test.com');
      setPassword('client123');
    }
  };

  const testHealthAPI = async () => {
    try {
      await healthCheck();
      Alert.alert('✅ API Test', 'La API está funcionando correctamente. Revisa la consola para ver el resultado.');
    } catch (error) {
      Alert.alert('❌ API Test', 'Error al conectar con la API. Asegúrate de que el servidor esté corriendo.');
      console.error('API Error:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
      justifyContent: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 40,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 8,
      padding: 16,
      fontSize: 16,
      marginBottom: 16,
      color: colors.text,
      elevation: 1,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginBottom: 16,
      elevation: 2,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    demoSection: {
      marginTop: 30,
      padding: 20,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#F3F4F6',
      elevation: 1,
    },
    demoTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    demoTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 16,
    },
    demoButton: {
      backgroundColor: '#F8FAFC',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 6,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 8,
    },
    demoButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    credentialsText: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 10,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agenda Pro</Text>
      <Text style={styles.subtitle}>Gestiona tu negocio de forma profesional</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor={colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>

      <View style={styles.demoSection}>
        <View style={styles.demoTitleContainer}>
          <IonIcon name="rocket" size={20} color={colors.primary} />
          <Text style={styles.demoTitle}>Cuentas de Demostración</Text>
        </View>
        
        <TouchableOpacity style={styles.demoButton} onPress={() => fillDemoCredentials('admin')}>
          <IonIcon name="briefcase" size={16} color={colors.text} />
          <Text style={styles.demoButtonText}>Acceder como Administrador</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.demoButton} onPress={() => fillDemoCredentials('client')}>
          <IonIcon name="person" size={16} color={colors.text} />
          <Text style={styles.demoButtonText}>Acceder como Cliente</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.demoButton, { backgroundColor: '#F0F9FF', borderColor: '#0EA5E9' }]} onPress={testHealthAPI}>
          <IonIcon name="build" size={16} color="#0EA5E9" />
          <Text style={[styles.demoButtonText, { color: '#0EA5E9' }]}>Probar API Health</Text>
        </TouchableOpacity>
        
        <Text style={styles.credentialsText}>
          Admin: admin@test.com / admin123{'\n'}
          Cliente: client@test.com / client123
        </Text>
      </View>
    </View>
  );
}
