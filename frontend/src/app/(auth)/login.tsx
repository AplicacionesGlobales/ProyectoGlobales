import { healthCheck } from '@/api';
import { useApp } from '@/contexts/AppContext';
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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useError, ErrorUtils, InlineError } from '@/components/ui/errors';
import { useNavigationLoading } from '@/hooks/useNavigationLoading';
import { NavigationLoadingOverlay } from '@/components/navigation/NavigationLoadingOverlay';

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
  const { isNavigating, navigateWithLoading, navigatingTo, currentMessage } = useNavigationLoading();

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
      const success = await login(email, password);
      if (success) {
        const isAdmin = email === 'admin@test.com';
        showSuccess('Login successful! Redirecting...', 2000);
        
        // Use navigation loading for smooth transition
        setTimeout(async () => {
          try {
            if (isAdmin) {
              await navigateWithLoading('/(admin-tabs)/appointments', {
                delay: 1500,
                message: 'Accessing Admin Dashboard...',
                replace: true
              });
            } else {
              await navigateWithLoading('/(client-tabs)', {
                delay: 1500,
                message: 'Accessing Your Dashboard...',
                replace: true
              });
            }
          } catch (error) {
            console.log('Navigation error:', error);
            router.replace('/');
          }
        }, 500);
      } else {
        showToast('Invalid email or password', 'error', 'high');
      }
    } catch (error: any) {
      // Handle server errors
      if (error?.response?.status === 401) {
        showToast('Invalid credentials', 'error', 'high');
      } else if (error?.response?.status === 429) {
        showToast('Too many login attempts. Please try again later.', 'error', 'high');
      } else {
        showApiError(error, 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    await navigateWithLoading('/register', {
      delay: 600,
      message: 'Opening Sign Up...'
    });
  };

  const handleForgotPassword = async () => {
    await navigateWithLoading('/(auth)/forgot-password/ForgotPassword', {
      delay: 600,
      message: 'Opening Forgot Password...'
    });
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
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 6,
            marginLeft: 2,
          }}>
            {options.label}
            {options.required && <Text style={{ color: '#ef4444' }}> *</Text>}
          </Text>
        )}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: hasError ? '#ef4444' : isFocused ? '#3b82f6' : isValid ? '#10b981' : '#e5e7eb',
          borderRadius: 12,
          paddingHorizontal: 14,
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
          <TextInput
            ref={field === 'email' ? emailInputRef : field === 'password' ? passwordInputRef : undefined}
            style={{
              flex: 1,
              paddingVertical: Platform.OS === 'ios' ? 14 : 10,
              fontSize: 16,
              color: '#1f2937',
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
            <TouchableOpacity onPress={options.onToggle} style={{ padding: 4 }}>
              <Ionicons 
                name={options.isVisible ? 'eye-off' : 'eye'} 
                size={20} 
                color="#9ca3af" 
              />
            </TouchableOpacity>
          )}
          {isValid && (
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          )}
        </View>
        
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
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar style="dark" />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={['#3b82f6', '#60a5fa', '#93c5fd']}
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
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 30 }}>
              <View style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}>
                <Ionicons name="calendar" size={45} color="#ffffff" />
              </View>
              <Text style={{
                fontSize: 34,
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: 8,
                textAlign: 'center',
              }}>
                Agenda Pro
              </Text>
              <Text style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
              }}>
                Manage your business professionally
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
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: 24,
                textAlign: 'center',
              }}>
                Welcome Back!
              </Text>

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
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}>
                <TouchableOpacity 
                  onPress={() => setRememberMe(!rememberMe)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: rememberMe ? '#3b82f6' : '#d1d5db',
                    backgroundColor: rememberMe ? '#3b82f6' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                  }}>
                    {rememberMe && (
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    )}
                  </View>
                  <Text style={{ color: '#6b7280', fontSize: 14 }}>
                    Remember me
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={{ 
                    color: '#3b82f6', 
                    fontSize: 14, 
                    fontWeight: '600' 
                  }}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                style={{
                  backgroundColor: '#3b82f6',
                  borderRadius: 12,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#3b82f6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                  marginBottom: 16,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={{
                      color: '#ffffff',
                      fontSize: 17,
                      fontWeight: '600',
                    }}>
                      Sign In
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Register Button */}
              <TouchableOpacity
                onPress={handleRegister}
                style={{
                  borderWidth: 2,
                  borderColor: '#3b82f6',
                  borderRadius: 12,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="person-add-outline" size={20} color="#3b82f6" style={{ marginRight: 8 }} />
                <Text style={{
                  color: '#3b82f6',
                  fontSize: 17,
                  fontWeight: '600',
                }}>
                  Create New Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* Social Login */}
            <View style={{ marginTop: 30 }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20,
              }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
                <Text style={{ paddingHorizontal: 12, color: '#6b7280', fontSize: 14 }}>
                  Or continue with
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity style={{
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
                  <Text style={{ marginLeft: 8, color: '#4b5563', fontWeight: '500' }}>
                    Google
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Demo Accounts */}
            <View style={{
              marginTop: 30,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: 'rgba(229, 231, 235, 0.5)',
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Ionicons name="rocket" size={20} color="#3b82f6" style={{ marginRight: 8 }} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#1f2937',
                }}>
                  Demo Accounts
                </Text>
              </View>

              <TouchableOpacity 
                onPress={() => fillDemoCredentials('admin')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f0f9ff',
                  borderWidth: 1,
                  borderColor: '#3b82f6',
                  borderRadius: 10,
                  paddingVertical: 12,
                  marginBottom: 10,
                }}
              >
                <Ionicons name="briefcase" size={18} color="#3b82f6" style={{ marginRight: 8 }} />
                <Text style={{ color: '#3b82f6', fontWeight: '600' }}>
                  Administrator
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => fillDemoCredentials('client')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f0fdf4',
                  borderWidth: 1,
                  borderColor: '#10b981',
                  borderRadius: 10,
                  paddingVertical: 12,
                  marginBottom: 10,
                }}
              >
                <Ionicons name="person" size={18} color="#10b981" style={{ marginRight: 8 }} />
                <Text style={{ color: '#10b981', fontWeight: '600' }}>
                  Client
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={testHealthAPI}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fef3c7',
                  borderWidth: 1,
                  borderColor: '#f59e0b',
                  borderRadius: 10,
                  paddingVertical: 12,
                }}
              >
                <Ionicons name="build" size={18} color="#f59e0b" style={{ marginRight: 8 }} />
                <Text style={{ color: '#f59e0b', fontWeight: '600' }}>
                  Test API
                </Text>
              </TouchableOpacity>

              <Text style={{
                fontSize: 11,
                color: '#6b7280',
                textAlign: 'center',
                marginTop: 12,
                lineHeight: 18,
              }}>
                Admin: admin@test.com / admin123{'\n'}
                Client: client@test.com / client123
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Navigation Loading Overlay */}
      <NavigationLoadingOverlay
        visible={isNavigating}
        message={currentMessage}
      />
    </View>
  );
}