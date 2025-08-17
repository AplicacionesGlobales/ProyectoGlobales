// components/AppBootstrap.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../contexts/ThemeContext';

interface AppBootstrapProps {
  children: React.ReactNode;
}

const { width, height } = Dimensions.get('window');

const AppBootstrap: React.FC<AppBootstrapProps> = ({ children }) => {
  const { colors, isConfigLoaded, reloadConfig } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    initializeApp();
  }, [isConfigLoaded]);

  const initializeApp = async () => {
    try {
      // Animación de entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Esperar a que la configuración esté cargada
      if (!isConfigLoaded) {
        return;
      }

      // Simular un delay mínimo para mejor UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Animación de salida del splash
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setIsLoading(false);
      });

    } catch (err) {
      console.error('Error initializing app:', err);
      setError('Error al cargar la configuración de la aplicación');
      
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  const retryInitialization = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await reloadConfig();
    } catch (err) {
      setError('Error al recargar la configuración');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        
        {/* Dynamic Gradient Background */}
        <LinearGradient
          colors={[
            colors.primary,
            colors.accent,
            colors.secondary
          ]}
          style={styles.gradientBackground}
        />
        
        <Animated.View 
          style={[
            styles.splashContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Logo */}
          {/* <View style={styles.logoContainer}>
            {appConfig?.logo ? (
              <Animated.Image
                source={{ uri: appConfig.logo.uri }}
                style={[
                  styles.logo,
                  {
                    width: Math.min(appConfig.logo.width, 120),
                    height: Math.min(appConfig.logo.height, 120),
                  }
                ]}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.defaultLogo, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="calendar" size={45} color="#ffffff" />
              </View>
            )}
          </View> */}

          {/* App Name */}
          {/* <Text style={styles.appName}>
            {appConfig?.branding.appName || 'Cargando...'}
          </Text>
          
          <Text style={styles.companyName}>
            {appConfig?.branding.companyName || 'Mi Empresa'}
          </Text> */}

          {/* Loading indicator */}
          <View style={styles.loadingContainer}>
            <ActivityIndicator 
              size="large" 
              color="rgba(255,255,255,0.8)" 
            />
            <Text style={styles.loadingText}>
              {error ? 'Reintentando...' : 'Personalizando tu experiencia...'}
            </Text>
          </View>

          {/* Error message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={retryInitialization}>
                <Text style={styles.retryText}>
                  Tocar para reintentar
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                { 
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  width: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]} 
            />
          </View>
        </View>
      </View>
    );
  }

  // App ya cargada, renderizar contenido principal
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  splashContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    maxWidth: 120,
    maxHeight: 120,
  },
  defaultLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 60,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 60,
    left: 40,
    right: 40,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
});

export default AppBootstrap;