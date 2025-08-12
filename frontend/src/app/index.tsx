import { useApp } from '@/contexts/AppContext';
import { Redirect } from 'expo-router';
import React from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, Animated } from 'react-native';
import { styled } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function RootScreen() {
  const { user, isLoading: authLoading } = useApp();
  const [isReady, setIsReady] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Small delay to ensure navigation is ready
    const timer = setTimeout(() => {
      setIsReady(true);

      // Animate the loading screen
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading while navigation is initializing OR while checking auth
  if (!isReady || authLoading) {
    return (
      <LinearGradient
        colors={['#3b82f6', '#60a5fa', '#93c5fd']}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <Animated.View style={{
          alignItems: 'center',
          justifyContent: 'center',
          opacity: fadeAnim,
        }}>
          <ActivityIndicator size="large" color="#ffffff" />
          <StyledText style={{
            marginTop: 16,
            fontSize: 16,
            fontWeight: '500',
            color: '#ffffff',
            opacity: 0.9,
          }}>
            {authLoading ? 'Verificando sesión...' : 'Iniciando...'}
          </StyledText>

          {authLoading && (
            <StyledText style={{
              marginTop: 4,
              fontSize: 12,
              color: '#ffffff',
              opacity: 0.7,
            }}>
              Comprobando tokens almacenados
            </StyledText>
          )}
        </Animated.View>
      </LinearGradient>
    );
  }

  console.log('🎯 RootScreen - Estado final:', {
    user: user?.email || 'No user',
    role: user?.role || 'No role',
    authLoading
  });

  // Use Redirect which is safer than router.replace in initial render
  if (!user) {
    console.log('➡️ Redirecting to auth');
    return <Redirect href="/(auth)" />;
  }

  // Redirect based on user role
  if (user.role === 'admin') {
    console.log('➡️ Redirecting to admin dashboard');
    return <Redirect href="/(admin-tabs)/appointments" />;
  } else {
    console.log('➡️ Redirecting to client dashboard');
    return <Redirect href="/(client-tabs)" />;
  }
}
