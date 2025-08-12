// screens/auth/forgot-password.tsx (Actualizado)
import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { styled } from 'nativewind';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ForgotPasswordHeader } from '../../../components/Auth/ForgotPassword/ForgotPasswordHeader';
import { ForgotPasswordForm } from '../../../components/Auth/ForgotPassword/ForgotPasswordForm';
import { useNavigationLoading } from '@/hooks/useNavigationLoading';
import { NavigationLoadingOverlay } from '@/components/navigation/NavigationLoadingOverlay';

const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);

export default function ForgotPasswordScreen() {
  const { isNavigating, navigateWithLoading, navigatingTo, currentMessage } = useNavigationLoading();

  const handleBackToLogin = async () => {
    await navigateWithLoading('/(auth)/login', {
      delay: 600,
      message: 'Returning to Sign In...'
    });
  };

  const handleSuccess = async () => {
    console.log('Password reset completed successfully');
    await navigateWithLoading('/(auth)/login', {
      delay: 600,
      message: 'Returning to Sign In...'
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Gradient Background */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 400,
          backgroundColor: '#3b82f6',
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 400,
          backgroundColor: 'rgba(96, 165, 250, 0.3)',
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
      />

      <StyledKeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ForgotPasswordHeader onBack={handleBackToLogin} />
        
        <StyledScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{
            paddingHorizontal: 24,
            paddingTop: 40,
            paddingBottom: 40,
          }}>
            {/* Header with Icon */}
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="key" size={45} color="#3b82f6" />
                </View>
              </View>
              <Text style={{
                fontSize: 36,
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: 8,
                textAlign: 'center',
              }}>
                Recuperar Contraseña
              </Text>
              <Text style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
              }}>
                Proceso seguro de 3 pasos
              </Text>
            </View>

            {/* Form Card */}
            <View style={{
              backgroundColor: '#ffffff',
              borderRadius: 24,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
            }}>
              <ForgotPasswordForm
                onSuccess={handleSuccess}
                onBackToLogin={handleBackToLogin}
              />
            </View>
          </View>
        </StyledScrollView>
      </StyledKeyboardAvoidingView>
      
      {/* Navigation Loading Overlay */}
      <NavigationLoadingOverlay
        visible={isNavigating}
        message={currentMessage}
      />
    </View>
  );
}