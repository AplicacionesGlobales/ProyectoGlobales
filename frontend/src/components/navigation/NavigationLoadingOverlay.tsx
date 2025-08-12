import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { LoadingSpinner } from '../ui/loading';

export interface NavigationLoadingOverlayProps {
  visible: boolean;
  message: string;
}

export const NavigationLoadingOverlay: React.FC<NavigationLoadingOverlayProps> = ({
  visible,
  message
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        opacity: fadeAnim,
      }}
    >
      <BlurView
        intensity={20}
        tint="light"
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
      
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 20,
          padding: 32,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 10,
        }}>
          <LoadingSpinner size="large" color="#3b82f6" />
          
          <Text style={{
            marginTop: 20,
            fontSize: 16,
            fontWeight: '600',
            color: '#1f2937',
            textAlign: 'center',
          }}>
            {message}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};
