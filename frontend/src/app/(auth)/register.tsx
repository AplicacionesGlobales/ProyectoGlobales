// screens/RegisterScreen.tsx
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Animated, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useError, ErrorUtils } from '@/components/ui/errors';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '../../services/authService';
import { useEmailValidation } from '../../hooks/useEmailValidation';
import { useUsernameValidation } from '../../hooks/useUsernameValidation';
import { usePasswordValidation } from '../../hooks/usePasswordValidation';

// Componentes
import RegisterHeader from '@/components/Auth/Register/RegisterHeader';
import RegisterForm from '@/components/Auth/Register/RegisterForm';
import SocialLogin from '@/components/Auth/SocialLogin';
import ThemedButton from '@/components/ui/ThemedButton';

export default function RegisterScreen() {
  // Theme and config
  const { colors, isConfigLoaded } = useTheme();
  
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { showToast, showSuccess, showValidationErrors } = useError();

  // Email validation hook
  const { 
    isValidating: isValidatingEmail, 
    isEmailAvailable, 
    validateEmailRealtime, 
    clearValidation: clearEmailValidation 
  } = useEmailValidation();

  // Username validation hook
  const { 
    isValidating: isValidatingUsername, 
    isUsernameAvailable, 
    validateUsernameRealtime, 
    clearValidation: clearUsernameValidation 
  } = useUsernameValidation();

  // Password validation hook
  const passwordValidation = usePasswordValidation(password);

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

  // Revalidar confirmPassword cuando password cambia
  useEffect(() => {
    if (confirmPassword && password) {
      const error = ErrorUtils.validateSingleField('confirmPassword', confirmPassword, password);
      setValidationErrors(prev => ({ ...prev, confirmPassword: error }));
    }
  }, [password, confirmPassword]);

  // Debounced validation for individual fields
  const debouncedValidation = useRef(
    ErrorUtils.debounceValidation((field: string, value: string, additionalValue?: string) => {
      const additionalVal = field === 'confirmPassword' ? password : additionalValue;
      const error = ErrorUtils.validateSingleField(field, value, additionalVal);
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    }, 300)
  ).current;

  const validateField = (field: string, value: string): string | null => {
    const error = ErrorUtils.validateSingleField(field, value, field === 'confirmPassword' ? password : undefined);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
    return error;
  };

  const handleRegister = async () => {
    // Validate all fields synchronously
    const localErrors = ErrorUtils.validateRegistrationForm(
      firstName,
      lastName,
      email,
      username,
      password,
      confirmPassword
    );
    
    setValidationErrors(localErrors);
    
    const hasErrors = Object.values(localErrors).some(error => error !== null);
    
    if (hasErrors) {
      const fieldErrors = Object.entries(localErrors)
        .filter(([_, error]) => error !== null)
        .map(([field, message]) => ({ field, message: message! }));
      
      showValidationErrors(fieldErrors);
      return;
    }

    if (!termsAccepted) {
      showToast('Please accept the terms and conditions', 'warning', 'medium');
      return;
    }

    setLoading(true);
    
    try {
      // Check password validation
      if (!passwordValidation.validation.isValid) {
        showToast('Please ensure your password meets all requirements', 'error', 'high');
        return;
      }

      // Check email availability
      if (isEmailAvailable === false) {
        showToast('Please use a different email address', 'error', 'high');
        return;
      }

      // Check username availability
      if (isUsernameAvailable === false) {
        showToast('Please choose a different username', 'error', 'high');
        return;
      }

      // Register with backend
      const response = await authService.register({
        firstName,
        lastName,
        email,
        username,
        password,
      });

      showSuccess(`Welcome ${firstName}! Your account has been created successfully.`, 4000);
      setTimeout(() => {
        router.replace('/');
      }, 1000);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle backend validation errors
      if (error?.message) {
        if (error.message.includes('email')) {
          setValidationErrors(prev => ({ ...prev, email: error.message }));
          showToast(error.message, 'error', 'high');
        } else if (error.message.includes('username')) {
          setValidationErrors(prev => ({ ...prev, username: error.message }));
          showToast(error.message, 'error', 'high');
        } else if (error.message.includes('password')) {
          showToast(error.message, 'error', 'high');
        } else {
          showToast(error.message, 'error', 'high');
        }
      } else {
        showToast('Registration failed. Please try again.', 'error', 'high');
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.navigate('./login');
  };

  const handleGoogleSignUp = () => {
    showToast('Google sign up coming soon!', 'info', 'medium');
  };

  const handleAppleSignUp = () => {
    showToast('Apple sign up coming soon!', 'info', 'medium');
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
      <StatusBar style="light" />
      
      {/* Dynamic Gradient Background */}
      <LinearGradient
        colors={[colors.primary, colors.accent, colors.secondary]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 350,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
            paddingHorizontal: 24,
            paddingTop: 60,
            paddingBottom: 40,
          }}>
            {/* Header with progress */}
            <RegisterHeader 
              title="Create Account"
              subtitle="Join Agenda Pro today"
              icon="person-add"
              currentStep={1}
              totalSteps={3}
            />

            {/* Registration Form */}
            <RegisterForm
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              email={email}
              setEmail={setEmail}
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              focusedField={focusedField}
              setFocusedField={setFocusedField}
              validationErrors={validationErrors}
              setValidationErrors={setValidationErrors}
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
              loading={loading}
              isValidatingEmail={isValidatingEmail}
              isEmailAvailable={isEmailAvailable}
              isValidatingUsername={isValidatingUsername}
              isUsernameAvailable={isUsernameAvailable}
              passwordValidation={passwordValidation}
              onRegister={handleRegister}
              debouncedValidation={debouncedValidation}
              validateField={validateField}
              validateEmailRealtime={validateEmailRealtime}
              validateUsernameRealtime={validateUsernameRealtime}
              clearEmailValidation={clearEmailValidation}
              clearUsernameValidation={clearUsernameValidation}
            />

            {/* Social Sign Up */}
            <SocialLogin
              onGoogleLogin={handleGoogleSignUp}
              onAppleLogin={handleAppleSignUp}
            />

            {/* Sign In Link */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 30,
            }}>
              <Text style={{ color: colors.textSecondary }}>
                Already have an account?{' '}
              </Text>
              <ThemedButton
                title="Sign In"
                variant="ghost"
                size="small"
                fullWidth={false}
                onPress={navigateToLogin}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}