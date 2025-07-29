import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    // Navigate to main app after successful registration
    Alert.alert('Success', 'Account created successfully', [
      {
        text: 'OK',
        onPress: () => router.replace('/')
      }
    ]);
  };

  const navigateToLogin = () => {
    router.navigate('./login');
  };

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: '#ffffff', 
      paddingHorizontal: 24, 
      justifyContent: 'center' 
    }}>
      <StatusBar style="dark" />
      
      <View style={{ marginBottom: 32 }}>
        <Text style={{ 
          fontSize: 32, 
          fontWeight: 'bold', 
          color: '#1f2937', 
          textAlign: 'center', 
          marginBottom: 8 
        }}>
          Create Account
        </Text>
        <Text style={{ 
          color: '#6b7280', 
          textAlign: 'center' 
        }}>
          Sign up to get started
        </Text>
      </View>

      <View style={{ gap: 16 }}>
        <View>
          <Text style={{ 
            color: '#374151', 
            marginBottom: 8, 
            fontWeight: '500' 
          }}>
            Full Name
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: '#1f2937',
              backgroundColor: '#ffffff'
            }}
            placeholder="Enter your full name"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View>
          <Text style={{ 
            color: '#374151', 
            marginBottom: 8, 
            fontWeight: '500' 
          }}>
            Email
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: '#1f2937',
              backgroundColor: '#ffffff'
            }}
            placeholder="Enter your email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View>
          <Text style={{ 
            color: '#374151', 
            marginBottom: 8, 
            fontWeight: '500' 
          }}>
            Password
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: '#1f2937',
              backgroundColor: '#ffffff'
            }}
            placeholder="Enter your password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View>
          <Text style={{ 
            color: '#374151', 
            marginBottom: 8, 
            fontWeight: '500' 
          }}>
            Confirm Password
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: '#1f2937',
              backgroundColor: '#ffffff'
            }}
            placeholder="Confirm your password"
            placeholderTextColor="#9ca3af"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: '#2563eb',
            borderRadius: 8,
            paddingVertical: 12,
            marginTop: 24
          }}
          onPress={handleRegister}
        >
          <Text style={{ 
            color: '#ffffff', 
            textAlign: 'center', 
            fontWeight: '600', 
            fontSize: 18 
          }}>
            Create Account
          </Text>
        </TouchableOpacity>

        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'center', 
          marginTop: 24 
        }}>
          <Text style={{ color: '#6b7280' }}>Already have an account? </Text>
          <TouchableOpacity onPress={navigateToLogin}>
            <Text style={{ 
              color: '#2563eb', 
              fontWeight: '600' 
            }}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
