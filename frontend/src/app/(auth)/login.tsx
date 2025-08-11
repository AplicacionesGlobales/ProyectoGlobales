import { healthCheck } from '@/api';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import React = require('react');
import { 
  ActivityIndicator, 
  Alert, 
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

const { width: screenWidth } = Dimensions.get('window');

export default function LoginScreen() {
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useApp();
  const { colors } = useTheme();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const validateField = (field: string, value: string) => {
    let error = '';
    
    switch(field) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) error = 'El email es requerido';
        else if (!emailRegex.test(value)) error = 'Formato de email inválido';
        break;
      case 'password':
        if (!value) error = 'La contraseña es requerida';
        else if (value.length < 6) error = 'Mínimo 6 caracteres';
        break;
    }
    
    setErrors((prev: any) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleLogin = async () => {
    // Validate fields
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);
    
    if (!isEmailValid || !isPasswordValid) {
      Alert.alert('Error de Validación', 'Por favor corrige los errores');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        const isAdmin = email === 'admin@test.com';
        
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
      } else {
        Alert.alert('Error', 'Credenciales incorrectas');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al iniciar sesión');
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
    // Auto-focus password field after filling
    setFocusedField('password');
  };

  const testHealthAPI = async () => {
    try {
      await healthCheck();
      Alert.alert('✅ API Test', 'La API está funcionando correctamente.');
    } catch (error) {
      Alert.alert('❌ API Test', 'Error al conectar con la API.');
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
    const hasError = errors[field];
    const isValid = value && !hasError && !isFocused;

    return (
      <Animated.View style={{ 
        marginBottom: 20,
        transform: [{
          scale: isFocused ? 1.02 : 1
        }]
      }}>
        {options.label && (
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 6,
            marginLeft: 2,
          }}>
            {options.label}
          </Text>
        )}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: hasError ? '#ef4444' : isFocused ? colors.primary : isValid ? '#10b981' : '#e5e7eb',
          borderRadius: 12,
          paddingHorizontal: 14,
          backgroundColor: isFocused ? colors.surface : '#ffffff',
          shadowColor: isFocused ? colors.primary : '#000',
          shadowOffset: { width: 0, height: isFocused ? 4 : 1 },
          shadowOpacity: isFocused ? 0.15 : 0.05,
          shadowRadius: isFocused ? 8 : 2,
          elevation: isFocused ? 4 : 1,
        }}>
          <Ionicons 
            name={icon as any} 
            size={22} 
            color={hasError ? '#ef4444' : isFocused ? colors.primary : colors.textSecondary} 
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={{
              flex: 1,
              paddingVertical: Platform.OS === 'ios' ? 16 : 12,
              fontSize: 16,
              color: colors.text,
            }}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            value={value}
            onChangeText={(text) => {
              setValue(text);
              if (errors[field]) {
                setErrors((prev: any) => ({ ...prev, [field]: '' }));
              }
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
                size={22} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          )}
          {isValid && (
            <Ionicons name="checkmark-circle" size={22} color="#10b981" />
          )}
        </View>
        {hasError && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginLeft: 2 }}>
            <Ionicons name="alert-circle" size={14} color="#ef4444" style={{ marginRight: 4 }} />
            <Text style={{ color: '#ef4444', fontSize: 12 }}>{hasError}</Text>
          </View>
        )}
      </Animated.View>
    );
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Gradient Background Alternative */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 400,
          backgroundColor: colors.primary,
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
            paddingTop: 80,
            paddingBottom: 40,
          }}>
            {/* Header with Animated Logo */}
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <Animated.View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                transform: [{ rotate: spin }]
              }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="calendar" size={45} color={colors.primary} />
                </View>
              </Animated.View>
              <Text style={{
                fontSize: 36,
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
                Gestiona tu negocio de forma profesional
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
                color: colors.text,
                marginBottom: 24,
                textAlign: 'center',
              }}>
                Bienvenido de vuelta
              </Text>

              {/* Email Input */}
              {renderInput(
                email,
                setEmail,
                'correo@ejemplo.com',
                'email',
                'mail-outline',
                { 
                  label: 'Correo Electrónico',
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
                  label: 'Contraseña',
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
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: rememberMe ? colors.primary : '#d1d5db',
                    backgroundColor: rememberMe ? colors.primary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                  }}>
                    {rememberMe && (
                      <Ionicons name="checkmark" size={14} color="#ffffff" />
                    )}
                  </View>
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                    Recordarme
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={{ 
                    color: colors.primary, 
                    fontSize: 14, 
                    fontWeight: '600' 
                  }}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: colors.primary,
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
                    <Ionicons name="log-in-outline" size={22} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={{
                      color: '#ffffff',
                      fontSize: 17,
                      fontWeight: '600',
                    }}>
                      Iniciar Sesión
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Register Button */}
              <TouchableOpacity
                onPress={handleRegister}
                style={{
                  borderWidth: 2,
                  borderColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="person-add-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={{
                  color: colors.primary,
                  fontSize: 17,
                  fontWeight: '600',
                }}>
                  Crear Cuenta Nueva
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
                <Text style={{ paddingHorizontal: 12, color: colors.textSecondary, fontSize: 14 }}>
                  O continúa con
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
                  <Ionicons name="logo-google" size={20} color="#EA4335" />
                  <Text style={{ marginLeft: 8, color: colors.text, fontWeight: '500' }}>
                    Google
                  </Text>
                </TouchableOpacity>

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
                  <Ionicons name="logo-apple" size={20} color="#000000" />
                  <Text style={{ marginLeft: 8, color: colors.text, fontWeight: '500' }}>
                    Apple
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
                <Ionicons name="rocket" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text,
                }}>
                  Cuentas de Demostración
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
                  Administrador
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
                  Cliente
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
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: 12,
                lineHeight: 18,
              }}>
                Admin: admin@test.com / admin123{'\n'}
                Cliente: client@test.com / client123
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}