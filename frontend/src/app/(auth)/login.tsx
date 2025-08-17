// screens/LoginScreen.tsx
import { healthCheck } from '@/api';
import { useApp } from '@/contexts/AppContext';
import { authService } from '@/services/authService';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Animated, Dimensions } from 'react-native';
import { styled } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { useError, ErrorUtils } from '@/components/ui/errors';
import { useTheme } from '@/contexts/ThemeContext';

// Componentes
import LoginHeader from '@/components/Login/LoginHeader';
import LoginForm from '@/components/Login/LoginForm';
import SocialLogin from '@/components/Login/SocialLogin';
import ThemedButton from '@/components/ui/ThemedButton';

const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);

const { width: screenWidth } = Dimensions.get('window');

export default function LoginScreen() {
  // Theme and app config
  const { colors, appConfig, isConfigLoaded } = useTheme();
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useApp();
  const { showToast, showModal, showApiError, showSuccess } = useError();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Wait for config to load before starting animations
    if (isConfigLoaded) {
      startAnimations();
    }
  }, [isConfigLoaded]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Validation
  const debouncedValidation = useRef(
    ErrorUtils.debounceValidation((field: string, value: string) => {
      const error = ErrorUtils.validateSingleField(field, value);
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    }, 300)
  ).current;

  const validateField = (field: string, value: string): string | null => {
    const error = ErrorUtils.validateSingleField(field, value);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
    return error;
  };

  // Handlers
  const handleLogin = async () => {
    // Validate all fields synchronously
    const localErrors = ErrorUtils.validateLoginForm(email, password);
    setValidationErrors(localErrors);

    // Check if there are any errors
    const hasErrors = Object.values(localErrors).some(error => error !== null);

    if (hasErrors) {
      const fieldErrors = Object.entries(localErrors)
        .filter(([_, error]) => error !== null)
        .map(([field, message]) => ({ field, message: message! }));

      if (fieldErrors.length === 1) {
        showToast(fieldErrors[0].message, 'validation', 'medium');
      } else {
        showToast(`Please fix ${fieldErrors.length} validation errors`, 'validation', 'medium');
      }
      return;
    }

    setLoading(true);
    try {
      const authResponse = await authService.login({
        email,
        password,
        rememberMe
      });

      const success = await login(authResponse.user.email, password);

      if (success) {
        const isAdmin = authResponse.user.role === 'ADMIN' || authResponse.user.role === 'ROOT';

        if (rememberMe) {
          showSuccess('Login successful! Session will be remembered.', 3000);
        } else {
          showSuccess('Login successful!', 2000);
        }

        setTimeout(() => {
          try {
            if (isAdmin) {
              router.replace('/(admin-tabs)/appointments');
            } else {
              router.replace('/(client-tabs)');
            }
          } catch (error) {
            console.log('Navigation error:', error);
            router.replace('/');
          }
        }, 100);
      }
    } catch (error: any) {
      console.error('Login error:', error);

      if (error.message?.includes('inválidas') || error.message?.includes('invalid')) {
        showToast('Invalid credentials', 'error', 'high');
      } else if (error.message?.includes('429') || error.message?.includes('many')) {
        showToast('Too many login attempts. Please try again later.', 'error', 'high');
      } else {
        showToast(error.message || 'Login failed. Please try again.', 'error', 'high');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password/ForgotPassword');
  };

  const handleGoogleLogin = () => {
    // Implement Google login
    showToast('Google login coming soon!', 'info', 'medium');
  };

  const testHealthAPI = async () => {
    try {
      await healthCheck();
      showSuccess('API is working correctly', 3000);
    } catch (error) {
      showToast('Error connecting to API', 'error', 'high');
      console.error('API Error:', error);
    }
  };

  // Show loading state while config loads
  if (!isConfigLoaded) {
    return (
      <StyledView style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.background 
      }}>
        {/* You could add a loading spinner here */}
      </StyledView>
    );
  }

  return (
    <StyledView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      {/* Dynamic Gradient Background */}
      <LinearGradient
        colors={[
          colors.primary,
          colors.accent,
          colors.secondary
        ]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 320,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      />

      <StyledKeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <StyledScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{
            paddingHorizontal: 24,
            paddingTop: 64,
            paddingBottom: 40,
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          }}>
            {/* Header with dynamic branding */}
            <LoginHeader />

            {/* Login Form */}
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              focusedField={focusedField}
              setFocusedField={setFocusedField}
              validationErrors={validationErrors}
              setValidationErrors={setValidationErrors}
              loading={loading}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onForgotPassword={handleForgotPassword}
              debouncedValidation={debouncedValidation}
              validateField={validateField}
            />

            {/* Social Login */}
            <SocialLogin
              onGoogleLogin={handleGoogleLogin}
            />

            {/* Development/Demo Section */}
            <StyledView style={{
              padding: 20,
              marginTop: 32,
              borderWidth: 1,
              borderColor: `${colors.textSecondary}20`,
              borderRadius: 16,
              backgroundColor: `${colors.surface}F5`,
            }}>
              <ThemedButton
                title="Test API"
                variant="outline"
                size="medium"
                icon="build"
                onPress={testHealthAPI}
                style={{
                  borderColor: colors.warning,
                  backgroundColor: `${colors.warning}10`,
                }}
              />
            </StyledView>
          </Animated.View>
        </StyledScrollView>
      </StyledKeyboardAvoidingView>
    </StyledView>
  );
}