import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmailValidationIndicatorProps {
  isValidating: boolean;
  isAvailable: boolean | null;
  email: string;
  style?: any;
}

export const EmailValidationIndicator: React.FC<EmailValidationIndicatorProps> = ({
  isValidating,
  isAvailable,
  email,
  style,
}) => {
  if (!email || !email.includes('@')) {
    return null;
  }

  if (isValidating) {
    return (
      <View style={[{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#f3f4f6',
        borderRadius: 6,
        marginTop: 4,
      }, style]}>
        <ActivityIndicator size="small" color="#6b7280" />
        <Text style={{
          marginLeft: 6,
          fontSize: 12,
          color: '#6b7280',
        }}>
          Checking email...
        </Text>
      </View>
    );
  }

  if (isAvailable === null) {
    return null;
  }

  return (
    <View style={[{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: isAvailable ? '#dcfce7' : '#fef2f2',
      borderRadius: 6,
      marginTop: 4,
    }, style]}>
      <Ionicons
        name={isAvailable ? 'checkmark-circle' : 'close-circle'}
        size={14}
        color={isAvailable ? '#16a34a' : '#dc2626'}
      />
      <Text style={{
        marginLeft: 4,
        fontSize: 12,
        color: isAvailable ? '#16a34a' : '#dc2626',
        fontWeight: '500',
      }}>
        {isAvailable ? 'Email available' : `${email} is already taken`}
      </Text>
    </View>
  );
};
