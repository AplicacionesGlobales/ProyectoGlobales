import React from 'react';
import { View, Text, SafeAreaView, Alert } from 'react-native';
import { Button } from '../components/ui/Button';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();
  const userId = route.params?.userId;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => navigation.navigate('Welcome')
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Home!
        </Text>
        
        {userId && (
          <Text className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            User ID: {userId}
          </Text>
        )}

        <Button
          title="Logout"
          onPress={handleLogout}
          color="error"
          variant="outline"
          size="md"
          rounded="lg"
        />
      </View>
    </SafeAreaView>
  );
}
