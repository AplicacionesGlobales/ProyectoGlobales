import { healthCheck } from '@/api';
import { useApp } from '@/contexts/AppContext';
import { authService } from '@/services/authService';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useError, ErrorUtils, InlineError } from '@/components/ui/errors';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);
const StyledScrollView = styled(ScrollView);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);

const { width: screenWidth } = Dimensions.get('window');

export default function LoginScreen() {
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({});
  const [rememberMe, setRememberMe] = useState(false);

  // Refs for focusing on first error
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const { login } = useApp();
  const { showToast, showModal, showApiError, showSuccess } = useError();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Entrance animations
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
  }, []);

  // Debounced validation for individual fields
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

  const focusFirstErrorField = (errors: Record<string, string | null>) => {
    if (errors.email) {
      emailInputRef.current?.focus();
    } else if (errors.password) {
      passwordInputRef.current?.focus();
    }
  };

  const handleLogin = async () => {
    // Validate all fields synchronously
    const localErrors = ErrorUtils.validateLoginForm(email, password);

    // Update state once
    setValidationErrors(localErrors);

    // Check if there are any errors
    const hasErrors = Object.values(localErrors).some(error => error !== null);

    if (hasErrors) {
      // Focus first error field
      focusFirstErrorField(localErrors);

      // Show validation errors
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
      // Usar authService directamente con rememberMe
      const authResponse = await authService.login({
        email,
        password,
        rememberMe
      });

      // Actualizar contexto de la app con los datos del usuario
      const success = await login(authResponse.user.email, password); // Mantener compatibilidad con useApp

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
      // Handle server errors
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
      showSuccess('API is working correctly', 3000);
    } catch (error) {
      showToast('Error connecting to API', 'error', 'high');
      console.error('API Error:', error);
    }
  };

  const renderInput = (
    value: string,
    setValue: (text: string) => void,
    placeholder: string,
    field: string,
    icon: string,
    options: any = {}
  ) => {
    const isFocused = focusedField === field;
    const hasError = validationErrors[field];
    const isValid = value && !hasError && !isFocused;

    return (
      <Animated.View style={{
        marginBottom: 16,
        transform: [{
          scale: isFocused ? 1.02 : 1
        }]
      }}>
        {options.label && (
          <StyledText style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 6,
            marginLeft: 2,
          }}>
            {options.label}
            {options.required && <StyledText style={{ color: '#ef4444' }}> *</StyledText>}
          </StyledText>
        )}
        <StyledView style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 2,
          borderRadius: 12,
          paddingHorizontal: 14,
          borderColor: hasError
            ? '#ef4444'
            : isFocused
              ? '#3b82f6'
              : isValid
                ? '#10b981'
                : '#e5e7eb',
          backgroundColor: isFocused ? '#f9fafb' : '#ffffff',
          shadowColor: isFocused ? '#3b82f6' : '#000',
          shadowOffset: { width: 0, height: isFocused ? 4 : 1 },
          shadowOpacity: isFocused ? 0.1 : 0.05,
          shadowRadius: isFocused ? 8 : 2,
          elevation: isFocused ? 4 : 1,
        }}>
          <Ionicons
            name={icon as any}
            size={20}
            color={hasError ? '#ef4444' : isFocused ? '#3b82f6' : '#9ca3af'}
            style={{ marginRight: 10 }}
          />
          <StyledTextInput
            ref={field === 'email' ? emailInputRef : field === 'password' ? passwordInputRef : undefined}
            style={{
              flex: 1,
              fontSize: 16,
              color: '#1f2937',
              paddingVertical: Platform.OS === 'ios' ? 14 : 10,
            }}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            value={value}
            onChangeText={(text) => {
              setValue(text);
              // Clear error immediately when user starts typing
              if (validationErrors[field]) {
                setValidationErrors(prev => ({ ...prev, [field]: null }));
              }
              // Use debounced validation for real-time feedback
              debouncedValidation(field, text);
            }}
            onFocus={() => setFocusedField(field)}
            onBlur={() => {
              setFocusedField(null);
              validateField(field, value);
            }}
            secureTextEntry={options.secureTextEntry}
            keyboardType={options.keyboardType}
            autoCapitalize={options.autoCapitalize || 'none'}
            autoCorrect={false}
          />
          {options.showToggle && (
            <StyledTouchableOpacity onPress={options.onToggle} style={{ padding: 4 }}>
              <Ionicons
                name={options.isVisible ? 'eye-off' : 'eye'}
                size={20}
                color="#9ca3af"
              />
            </StyledTouchableOpacity>
          )}
          {isValid && (
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          )}
        </StyledView>

        {/* Error component */}
        <InlineError
          message={hasError || ''}
          type="validation"
          visible={!!hasError}
          compact={true}
          showIcon={true}
          dismissible={false}
        />
      </Animated.View>
    );
  };

  return (
    <StyledView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar style="dark" />

      {/* Gradient Background */}
      <LinearGradient
        colors={['#3b82f6', '#60a5fa', '#93c5fd']}
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
            {/* Header */}
            <StyledView style={{ alignItems: 'center', marginBottom: 32 }}>
              <StyledView style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                marginBottom: 20,
                borderRadius: 40,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }}>
                <Ionicons name="calendar" size={45} color="#ffffff" />
              </StyledView>
              <StyledText style={{
                marginBottom: 8,
                fontSize: 28,
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#ffffff',
              }}>
                Agenda Pro
              </StyledText>
              <StyledText style={{
                fontSize: 16,
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.9)',
              }}>
                Manage your business professionally
              </StyledText>
            </StyledView>

            {/* Form Card */}
            <StyledView style={{
              padding: 24,
              backgroundColor: '#ffffff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
              borderRadius: 24,
            }}>
              <StyledText style={{
                marginBottom: 24,
                fontSize: 24,
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#1f2937',
              }}>
                Welcome Back!
              </StyledText>

              {/* Email Input */}
              {renderInput(
                email,
                setEmail,
                'john@example.com',
                'email',
                'mail-outline',
                {
                  label: 'Email Address',
                  required: true,
                  keyboardType: 'email-address'
                }
              )}

              {/* Password Input */}
              {renderInput(
                password,
                setPassword,
                '••••••••',
                'password',
                'lock-closed-outline',
                {
                  label: 'Password',
                  required: true,
                  secureTextEntry: !showPassword,
                  showToggle: true,
                  isVisible: showPassword,
                  onToggle: () => setShowPassword(!showPassword)
                }
              )}

              {/* Remember Me & Forgot Password Row */}
              <StyledView style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
              }}>
                <StyledTouchableOpacity
                  onPress={() => setRememberMe(!rememberMe)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <StyledView style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    borderWidth: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                    borderColor: rememberMe ? '#3b82f6' : '#d1d5db',
                    backgroundColor: rememberMe ? '#3b82f6' : 'transparent',
                  }}>
                    {rememberMe && (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    )}
                  </StyledView>
                  <StyledText style={{
                    fontSize: 14,
                    color: '#6b7280',
                  }}>
                    Remember me
                  </StyledText>
                </StyledTouchableOpacity>

                <StyledTouchableOpacity onPress={handleForgotPassword}>
                  <StyledText style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#3b82f6',
                  }}>
                    Forgot password?
                  </StyledText>
                </StyledTouchableOpacity>
              </StyledView>

              {/* Login Button */}
              <StyledTouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 16,
                  marginBottom: 16,
                  backgroundColor: '#3b82f6',
                  borderRadius: 12,
                  shadowColor: '#3b82f6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                    <StyledText style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: '#ffffff',
                    }}>
                      Sign In
                    </StyledText>
                  </>
                )}
              </StyledTouchableOpacity>

              {/* Register Button */}
              <StyledTouchableOpacity
                onPress={handleRegister}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 16,
                  borderWidth: 2,
                  borderColor: '#3b82f6',
                  borderRadius: 12,
                }}
              >
                <Ionicons name="person-add-outline" size={20} color="#3b82f6" style={{ marginRight: 8 }} />
                <StyledText style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#3b82f6',
                }}>
                  Create New Account
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>

            {/* Social Login */}
            <StyledView style={{ marginTop: 32 }}>
              <StyledView style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20,
              }}>
                <StyledView style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: '#e5e7eb',
                }} />
                <StyledText style={{
                  paddingHorizontal: 12,
                  fontSize: 14,
                  color: '#6b7280',
                }}>
                  Or continue with
                </StyledText>
                <StyledView style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: '#e5e7eb',
                }} />
              </StyledView>

              <StyledView style={{ flexDirection: 'row', gap: 12 }}>
                <StyledTouchableOpacity style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff',
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 12,
                  paddingVertical: 14,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}>
                  <Ionicons name="logo-google" size={20} color="#3b82f6" />
                  <StyledText style={{
                    marginLeft: 8,
                    fontWeight: '500',
                    color: '#4b5563',
                  }}>
                    Google
                  </StyledText>
                </StyledTouchableOpacity>
              </StyledView>
            </StyledView>

            {/* Demo Accounts */}
            <StyledView style={{
              padding: 20,
              marginTop: 32,
              borderWidth: 1,
              borderColor: 'rgba(229, 231, 235, 0.5)',
              borderRadius: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}>
              <StyledView style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Ionicons name="rocket" size={20} color="#3b82f6" style={{ marginRight: 8 }} />
                <StyledText style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#1f2937',
                }}>
                  Demo Accounts
                </StyledText>
              </StyledView>

              <StyledTouchableOpacity
                onPress={() => fillDemoCredentials('admin')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#dbeafe',
                  borderWidth: 1,
                  borderColor: '#3b82f6',
                  borderRadius: 8,
                  paddingVertical: 12,
                  marginBottom: 10,
                }}
              >
                <Ionicons name="briefcase" size={18} color="#3b82f6" style={{ marginRight: 8 }} />
                <StyledText style={{
                  fontWeight: '600',
                  color: '#3b82f6',
                }}>
                  Administrator
                </StyledText>
              </StyledTouchableOpacity>

              <StyledTouchableOpacity
                onPress={() => fillDemoCredentials('client')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#d1fae5',
                  borderWidth: 1,
                  borderColor: '#10b981',
                  borderRadius: 8,
                  paddingVertical: 12,
                  marginBottom: 10,
                }}
              >
                <Ionicons name="person" size={18} color="#10b981" style={{ marginRight: 8 }} />
                <StyledText style={{
                  fontWeight: '600',
                  color: '#10b981',
                }}>
                  Client
                </StyledText>
              </StyledTouchableOpacity>

              <StyledTouchableOpacity
                onPress={testHealthAPI}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: '#f59e0b',
                  borderRadius: 8,
                  backgroundColor: '#fef3c7',
                }}
              >
                <Ionicons name="build" size={18} color="#f59e0b" style={{ marginRight: 8 }} />
                <StyledText style={{
                  fontWeight: '600',
                  color: '#d97706',
                }}>
                  Test API
                </StyledText>
              </StyledTouchableOpacity>

              <StyledText style={{
                marginTop: 12,
                fontSize: 12,
                lineHeight: 20,
                textAlign: 'center',
                color: '#6b7280',
              }}>
                Admin: admin@test.com / admin123{'\n'}
                Client: client@test.com / client123
              </StyledText>
            </StyledView>
          </Animated.View>
        </StyledScrollView>
      </StyledKeyboardAvoidingView>
    </StyledView>
  );
}