import React, { useState } from 'react';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ResponsiveUtils } from '../utils/responsive';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isTablet = ResponsiveUtils.isTablet();

  const handleLogin = async () => {
    setLoading(true);
    
    // Simulación de login
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Login successful!', [
        { text: 'OK', onPress: () => navigation.navigate('Home', { userId: 1 }) },
      ]);
    }, 2000);
  };

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
          <View className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${isTablet ? 'max-w-2xl' : 'max-w-lg'} w-full mx-auto`}>
            {/* Header */}
            <Text className={`${isTablet ? 'text-4xl' : 'text-3xl'} font-bold text-center text-gray-900 dark:text-white mb-8`}>
              Welcome Back
            </Text>

            {/* Form */}
            <View className="space-y-4">
              <Input
                label="Email Address"
                placeholder="john.doe@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                required
                size={isTablet ? 'lg' : 'md'}
                variant="outline"
                rounded="lg"
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                rightIcon={<Text>{showPassword ? '🙈' : '👁️'}</Text>}
                onRightIconPress={() => setShowPassword(!showPassword)}
                required
                size={isTablet ? 'lg' : 'md'}
                variant="outline"
                rounded="lg"
              />

              <TouchableOpacity className="self-end">
                <Text className="text-blue-600 dark:text-blue-400 text-sm">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              disabled={loading || !email || !password}
              size={isTablet ? 'lg' : 'md'}
              color="primary"
              variant="solid"
              fullWidth
              rounded="lg"
              shadow
              buttonClassName="mt-6"
            />

            {/* Register Link */}
            <View className="flex-row justify-center items-center mt-8">
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Don't have an account?
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Register')}
                className="ml-1"
              >
                <Text className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
