import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRegister } from '../hooks/useRegister';
import { RegisterFormData } from '../types/auth.types';
import { ResponsiveUtils } from '../utils/responsive';

// Icon components (replace with react-native-vector-icons or lucide-react-native)
const EmailIcon = () => <Text className="text-gray-500">📧</Text>;
const UserIcon = () => <Text className="text-gray-500">👤</Text>;
const LockIcon = () => <Text className="text-gray-500">🔒</Text>;
const EyeIcon = () => <Text className="text-gray-500">👁️</Text>;
const EyeOffIcon = () => <Text className="text-gray-500">🙈</Text>;
const CheckIcon = () => <Text className="text-green-500">✓</Text>;
const XIcon = () => <Text className="text-red-500">✗</Text>;

// Password Strength Utils
export class PasswordStrengthUtils {
  static calculateStrength(password: string): number {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[@$!%*?&]/.test(password)) strength += 12.5;
    
    return strength;
  }

  static getStrengthColor(strength: number): string {
    if (strength < 50) return 'bg-red-500';
    if (strength < 75) return 'bg-amber-500';
    return 'bg-green-500';
  }

  static getStrengthText(strength: number): string {
    if (strength < 50) return 'Weak';
    if (strength < 75) return 'Medium';
    return 'Strong';
  }

  static getStrengthTextColor(strength: number): string {
    if (strength < 50) return 'text-red-500';
    if (strength < 75) return 'text-amber-500';
    return 'text-green-500';
  }
}

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { register, loading, error, success, errors, validateField, clearErrors } = useRegister(
    (response) => {
      Alert.alert('Success', 'Registration successful!', [
        { text: 'OK', onPress: () => navigation.navigate('Login' as never) },
      ]);
    },
    (error) => {
      Alert.alert('Error', error.message);
    }
  );

  useEffect(() => {
    const strength = PasswordStrengthUtils.calculateStrength(formData.password);
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearErrors();
  };

  const handleBlur = (field: keyof RegisterFormData) => {
  if (field === 'confirmPassword') {
    validateField('confirmPassword', formData.confirmPassword, formData.password);
  } else {
      const value = formData[field];
      if (value !== undefined) {
        validateField(field, value);
      }
    }
  };

  const handleSubmit = async () => {
    await register(formData);
  };

  // Responsive configuration
  const isTablet = ResponsiveUtils.isTablet();
  const isSmallDevice = ResponsiveUtils.isSmallDevice();
  const formMaxWidth = isTablet ? 'max-w-2xl' : 'max-w-lg';
  const titleSize = isTablet ? 'text-4xl' : isSmallDevice ? 'text-2xl' : 'text-3xl';
  const subtitleSize = isTablet ? 'text-lg' : isSmallDevice ? 'text-sm' : 'text-base';

  // Password requirements
  const passwordRequirements = [
    { met: formData.password.length >= 8, text: 'At least 8 characters' },
    { met: /[a-z]/.test(formData.password), text: 'One lowercase letter' },
    { met: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
    { met: /[0-9]/.test(formData.password), text: 'One number' },
    { met: /[@$!%*?&]/.test(formData.password), text: 'One special character' },
  ];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className={`flex-1 px-5 py-10 ${isTablet ? 'px-10' : ''}`}>
          <View className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${formMaxWidth} w-full mx-auto`}>
            {/* Header */}
            <View className="mb-8">
              <Text className={`${titleSize} font-bold text-center text-gray-900 dark:text-white mb-2`}>
                Create Account
              </Text>
              <Text className={`${subtitleSize} text-center text-gray-600 dark:text-gray-400`}>
                Sign up to get started with our platform
              </Text>
            </View>

            {/* Success Message */}
            {success && (
              <View className="bg-green-100 dark:bg-green-900/30 border border-green-400 rounded-lg p-4 mb-6">
                <Text className="text-green-700 dark:text-green-400 text-center font-medium">
                  Registration successful! Redirecting...
                </Text>
              </View>
            )}

            {/* Error Message */}
            {error && !Object.keys(errors).length && (
              <View className="bg-red-100 dark:bg-red-900/30 border border-red-400 rounded-lg p-4 mb-6">
                <Text className="text-red-700 dark:text-red-400 text-center font-medium">
                  {error.message}
                </Text>
              </View>
            )}

            {/* Form Fields */}
            <View className="space-y-4">
              {/* Email */}
              <Input
                label="Email Address"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChangeText={(value: string) => handleChange('email', value)}
                onBlur={() => handleBlur('email')}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon={<EmailIcon />}
                required
                size={isTablet ? 'lg' : 'md'}
                variant="outline"
                rounded="lg"
              />

              {/* Username */}
              <Input
                label="Username"
                placeholder="johndoe"
                value={formData.username}
                onChangeText={(value: string) => handleChange('username', value)}
                onBlur={() => handleBlur('username')}
                error={errors.username}
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon={<UserIcon />}
                required
                size={isTablet ? 'lg' : 'md'}
                variant="outline"
                rounded="lg"
                helperText="This will be your unique identifier"
              />

              {/* Name Fields Row */}
              <View className={`${isTablet ? 'flex-row gap-4' : ''}`}>
                <View className={isTablet ? 'flex-1' : 'mb-4'}>
                  <Input
                    label="First Name"
                    placeholder="John"
                    value={formData.firstName || ''}
                    onChangeText={(value: string) => handleChange('firstName', value)}
                    onBlur={() => handleBlur('firstName')}
                    error={errors.firstName}
                    size={isTablet ? 'lg' : 'md'}
                    variant="outline"
                    rounded="lg"
                  />
                </View>

                <View className={isTablet ? 'flex-1' : ''}>
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    value={formData.lastName || ''}
                    onChangeText={(value: string) => handleChange('lastName', value)}
                    onBlur={() => handleBlur('lastName')}
                    error={errors.lastName}
                    size={isTablet ? 'lg' : 'md'}
                    variant="outline"
                    rounded="lg"
                  />
                </View>
              </View>

              {/* Password */}
              <View>
                <Input
                  label="Password"
                  placeholder="Enter a secure password"
                  value={formData.password}
                  onChangeText={(value: string) => handleChange('password', value)}
                  onBlur={() => handleBlur('password')}
                  error={errors.password}
                  secureTextEntry={!showPassword}
                  leftIcon={<LockIcon />}
                  rightIcon={showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  required
                  size={isTablet ? 'lg' : 'md'}
                  variant="outline"
                  rounded="lg"
                />

                {/* Password Strength Indicator */}
                {formData.password && (
                  <View className="mt-3 mb-2">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className={`text-xs font-medium ${PasswordStrengthUtils.getStrengthTextColor(passwordStrength)}`}>
                        Password strength: {PasswordStrengthUtils.getStrengthText(passwordStrength)}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {passwordStrength}%
                      </Text>
                    </View>
                    <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <View 
                        className={`h-full ${PasswordStrengthUtils.getStrengthColor(passwordStrength)} transition-all duration-300`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </View>

                    {/* Password Requirements */}
                    <View className="mt-3 space-y-1">
                      {passwordRequirements.map((req, index) => (
                        <View key={index} className="flex-row items-center">
                          {req.met ? <CheckIcon /> : <XIcon />}
                          <Text className={`text-xs ml-2 ${req.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {req.text}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Confirm Password */}
              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChangeText={(value: string) => handleChange('confirmPassword', value)}
                onBlur={() => handleBlur('confirmPassword')}
                error={errors.confirmPassword}
                secureTextEntry={!showConfirmPassword}
                leftIcon={<LockIcon />}
                rightIcon={showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                required
                size={isTablet ? 'lg' : 'md'}
                variant="outline"
                rounded="lg"
              />
            </View>

            {/* Submit Button */}
            <Button
              title="Create Account"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || !formData.email || !formData.username || !formData.password || !formData.confirmPassword}
              size={isTablet ? 'lg' : 'md'}
              color="primary"
              variant="solid"
              fullWidth
              rounded="lg"
              shadow
              buttonClassName="mt-8"
            />

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
              <Text className="px-4 text-sm text-gray-500 dark:text-gray-400">OR</Text>
              <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
            </View>

            {/* Social Login Buttons */}
            <View className={`${isTablet ? 'flex-row gap-4' : 'space-y-3'}`}>
              <Button
                title="Sign up with Google"
                leftIcon={<Text>🔍</Text>}
                size={isTablet ? 'lg' : 'md'}
                color="secondary"
                variant="outline"
                fullWidth={!isTablet}
                rounded="lg"
                buttonClassName={isTablet ? 'flex-1' : ''}
                onPress={() => Alert.alert('Google Sign Up', 'Coming soon!')}
              />
              
              <Button
                title="Sign up with Apple"
                leftIcon={<Text>🍎</Text>}
                size={isTablet ? 'lg' : 'md'}
                color="secondary"
                variant="outline"
                fullWidth={!isTablet}
                rounded="lg"
                buttonClassName={isTablet ? 'flex-1' : ''}
                onPress={() => Alert.alert('Apple Sign Up', 'Coming soon!')}
              />
            </View>

            {/* Login Link */}
            <View className="flex-row justify-center items-center mt-8">
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Already have an account?
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Login' as never)}
                className="ml-1"
              >
                <Text className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms and Privacy */}
            <View className="mt-6">
              <Text className="text-xs text-center text-gray-500 dark:text-gray-400">
                By creating an account, you agree to our{' '}
                <Text className="text-blue-600 dark:text-blue-400 font-medium">Terms of Service</Text>
                {' '}and{' '}
                <Text className="text-blue-600 dark:text-blue-400 font-medium">Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
