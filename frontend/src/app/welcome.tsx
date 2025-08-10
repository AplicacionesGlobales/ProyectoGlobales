import React from 'react';
import { View, Text, Image, SafeAreaView } from 'react-native';
import { Button } from '../components/ui/Button';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ResponsiveUtils } from '../utils/responsive';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const isTablet = ResponsiveUtils.isTablet();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 justify-center items-center px-6">
        {/* Logo o imagen */}
        <View className="mb-8">
          <Text className="text-6xl">🌍</Text>
        </View>

        {/* Título */}
        <Text className={`${isTablet ? 'text-5xl' : 'text-4xl'} font-bold text-center text-gray-900 dark:text-white mb-4`}>
          ProyectoGlobales
        </Text>

        {/* Subtítulo */}
        <Text className={`${isTablet ? 'text-xl' : 'text-lg'} text-center text-gray-600 dark:text-gray-400 mb-12 px-4`}>
          Welcome to our platform. Get started by creating an account or signing in.
        </Text>

        {/* Botones */}
        <View className={`w-full ${isTablet ? 'max-w-md' : 'max-w-sm'} space-y-4`}>
          <Button
            title="Create Account"
            onPress={() => navigation.navigate('Register')}
            size={isTablet ? 'lg' : 'md'}
            color="primary"
            variant="solid"
            fullWidth
            rounded="lg"
            shadow
          />

          <Button
            title="Sign In"
            onPress={() => navigation.navigate('Login')}
            size={isTablet ? 'lg' : 'md'}
            color="secondary"
            variant="outline"
            fullWidth
            rounded="lg"
          />
        </View>

        {/* Footer */}
        <View className="absolute bottom-10">
          <Text className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Version 1.0.0
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}