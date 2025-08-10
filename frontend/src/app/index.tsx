import { useApp } from '@/contexts/AppContext';
import { Redirect } from 'expo-router';
import React from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootScreen() {
  const { user } = useApp();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure navigation is ready
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading while navigation is initializing
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // Use Redirect which is safer than router.replace in initial render
  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  // Redirect based on user role
  if (user.role === 'admin') {
    return <Redirect href="/(admin-tabs)/appointments" />;
  } else {
    return <Redirect href="/(client-tabs)" />;
  }
}
