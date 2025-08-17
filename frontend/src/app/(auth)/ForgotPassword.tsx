// screens/auth/forgot-password.tsx
import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { styled } from 'nativewind';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { ForgotPasswordHeader } from '../../components/Auth/ForgotPassword/ForgotPasswordHeader';
import { ForgotPasswordForm } from '../../components/Auth/ForgotPassword/ForgotPasswordForm';

const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);

export default function ForgotPasswordScreen() {
  const { colors, isConfigLoaded } = useTheme();

  const handleBackToLogin = () => {
    router.back();
  };

  const handleSuccess = () => {
    console.log('Password reset completed successfully');
    router.push('/(auth)/login');
  };

  // Show loading state while config loads
  if (!isConfigLoaded) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.background 
      }}>
        {/* Loading spinner while theme loads */}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Dynamic Gradient Background */}
      <LinearGradient
        colors={[colors.primary, colors.accent, colors.secondary]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 400,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
      />
      
      {/* Overlay for softer gradient */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
                  <Ionicons name="key" size={45} color={colors.primary} />
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
              backgroundColor: colors.surface,
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
    </View>
  );
}