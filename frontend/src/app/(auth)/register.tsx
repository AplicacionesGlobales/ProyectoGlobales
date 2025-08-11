import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useError, ErrorUtils, InlineError } from '@/components/ui/errors';
import { authService } from '../../services/authService';
import { useEmailValidation } from '../../hooks/useEmailValidation';
import { useUsernameValidation } from '../../hooks/useUsernameValidation';
import { usePasswordValidation } from '../../hooks/usePasswordValidation';
import { EmailValidationIndicator } from '../../components/EmailValidationIndicator';
import { UsernameValidationIndicator } from '../../components/UsernameValidationIndicator';
import { PasswordStrengthIndicator } from '../../components/PasswordStrengthIndicator';

const { width: screenWidth } = Dimensions.get('window');

export default function RegisterScreen() {
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

  // Refs for focusing on first error
  const firstNameInputRef = useRef<TextInput>(null);
  const lastNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const { showToast, showModal, showSuccess, showValidationErrors } = useError();

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
  const progressAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    // Animate progress bar based on password validation
    Animated.timing(progressAnim, {
      toValue: passwordValidation.validation.strength,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [passwordValidation.validation.strength]);

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
      // Para confirmPassword necesitamos pasar la contraseña actual
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

  const focusFirstErrorField = (errors: Record<string, string | null>) => {
    if (errors.firstName) {
      firstNameInputRef.current?.focus();
    } else if (errors.lastName) {
      lastNameInputRef.current?.focus();
    } else if (errors.email) {
      emailInputRef.current?.focus();
    } else if (errors.username) {
      usernameInputRef.current?.focus();
    } else if (errors.password) {
      passwordInputRef.current?.focus();
    } else if (errors.confirmPassword) {
      confirmPasswordInputRef.current?.focus();
    }
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
          emailInputRef.current?.focus();
        } else if (error.message.includes('username')) {
          setValidationErrors(prev => ({ ...prev, username: error.message }));
          showToast(error.message, 'error', 'high');
          usernameInputRef.current?.focus();
        } else if (error.message.includes('password')) {
          showToast(error.message, 'error', 'high');
          passwordInputRef.current?.focus();
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

  const getFieldRef = (field: string) => {
    switch (field) {
      case 'firstName': return firstNameInputRef;
      case 'lastName': return lastNameInputRef;
      case 'email': return emailInputRef;
      case 'username': return usernameInputRef;
      case 'password': return passwordInputRef;
      case 'confirmPassword': return confirmPasswordInputRef;
      default: return null;
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
    
    // For email and username, also consider availability validation
    let isValid = value && !hasError && !isFocused;
    
    if (field === 'email' && isEmailAvailable === false) {
      isValid = false; // Email is taken, so not valid
    }
    
    if (field === 'username' && isUsernameAvailable === false) {
      isValid = false; // Username is taken, so not valid
    }

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
            ref={getFieldRef(field)}
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
                setValidationErrors((prev: any) => ({ ...prev, [field]: null }));
              }
              
              // Real-time email validation
              if (field === 'email') {
                clearEmailValidation();
                validateEmailRealtime(text);
              }
              
              // Real-time username validation
              if (field === 'username') {
                clearUsernameValidation();
                validateUsernameRealtime(text);
              }
              
              // Debounced validation for real-time feedback
              // Para confirmPassword, necesitamos pasar la contraseña actual
              if (field === 'confirmPassword') {
                debouncedValidation(field, text, password);
              } else {
                debouncedValidation(field, text);
              }
            }}
            onFocus={() => setFocusedField(field)}
            onBlur={() => {
              setFocusedField(null);
              // Immediate validation on blur
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
        
        {/* Email validation indicator */}
        {field === 'email' && (
          <EmailValidationIndicator
            isValidating={isValidatingEmail}
            isAvailable={isEmailAvailable}
            email={value}
          />
        )}
        
        {/* Username validation indicator */}
        {field === 'username' && (
          <UsernameValidationIndicator
            isValidating={isValidatingUsername}
            isAvailable={isUsernameAvailable}
            username={value}
          />
        )}
        
        {/* Password strength indicator */}
        {field === 'password' && value && (
          <PasswordStrengthIndicator
            validation={passwordValidation.validation}
            password={value}
            strengthColor={passwordValidation.getStrengthColor()}
            strengthText={passwordValidation.getStrengthText()}
          />
        )}
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
                <Ionicons name="person-add" size={45} color="#ffffff" />
              </View>
              <Text style={{
                fontSize: 34,
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: 8,
                textAlign: 'center',
              }}>
                Create Account
              </Text>
              <Text style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
              }}>
                Join Agenda Pro today
              </Text>
            </View>

            {/* Progress Steps */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 25,
              gap: 8,
            }}>
              {[1, 2, 3].map((step) => (
                <View
                  key={step}
                  style={{
                    width: step === 1 ? 40 : 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: step === 1 ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                  }}
                />
              ))}
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
              {/* Name Row */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  {renderInput(
                    firstName,
                    setFirstName,
                    'John',
                    'firstName',
                    'person-outline',
                    { 
                      label: 'First Name',
                      required: true,
                      autoCapitalize: 'words'
                    }
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  {renderInput(
                    lastName,
                    setLastName,
                    'Doe',
                    'lastName',
                    'person-outline',
                    { 
                      label: 'Last Name',
                      required: true,
                      autoCapitalize: 'words'
                    }
                  )}
                </View>
              </View>

              {/* Email */}
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

              {/* Username */}
              {renderInput(
                username,
                setUsername,
                'johndoe',
                'username',
                'at',
                { 
                  label: 'Username',
                  required: true
                }
              )}

              {/* Password */}
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

              {/* Confirm Password */}
              {renderInput(
                confirmPassword,
                setConfirmPassword,
                '••••••••',
                'confirmPassword',
                'lock-closed-outline',
                { 
                  label: 'Confirm Password',
                  required: true,
                  secureTextEntry: !showConfirmPassword,
                  showToggle: true,
                  isVisible: showConfirmPassword,
                  onToggle: () => setShowConfirmPassword(!showConfirmPassword)
                }
              )}

              {/* Terms and Conditions */}
              <TouchableOpacity 
                onPress={() => setTermsAccepted(!termsAccepted)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 20,
                  paddingVertical: 8,
                }}
              >
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: termsAccepted ? '#3b82f6' : '#d1d5db',
                  backgroundColor: termsAccepted ? '#3b82f6' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}>
                  {termsAccepted && (
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  )}
                </View>
                <Text style={{ flex: 1, color: '#4b5563', fontSize: 14 }}>
                  I agree to the{' '}
                  <Text style={{ color: '#3b82f6', fontWeight: '600' }}>
                    Terms & Conditions
                  </Text>
                  {' '}and{' '}
                  <Text style={{ color: '#3b82f6', fontWeight: '600' }}>
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleRegister}
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
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="rocket" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={{
                      color: '#ffffff',
                      fontSize: 17,
                      fontWeight: '600',
                    }}>
                      Create My Account
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Social Sign Up */}
            <View style={{ marginTop: 30 }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20,
              }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
                <Text style={{ paddingHorizontal: 12, color: '#6b7280', fontSize: 14 }}>
                  Or sign up with
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
                  <Text style={{ marginLeft: 8, color: '#4b5563', fontWeight: '500' }}>
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
                  <Text style={{ marginLeft: 8, color: '#4b5563', fontWeight: '500' }}>
                    Apple
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Link */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 30,
            }}>
              <Text style={{ color: '#6b7280' }}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text style={{ color: '#3b82f6', fontWeight: '600' }}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}