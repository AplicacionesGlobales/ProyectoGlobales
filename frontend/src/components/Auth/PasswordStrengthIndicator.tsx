import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PasswordValidation } from '../../hooks/usePasswordValidation';

interface PasswordStrengthIndicatorProps {
  validation: PasswordValidation;
  password: string;
  strengthColor: string;
  strengthText: string;
  style?: any;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  validation,
  password,
  strengthColor,
  strengthText,
  style,
}) => {
  if (!password) {
    return null;
  }

  const requirements = [
    { met: validation.minLength, text: 'At least 6 characters' },
    { met: validation.hasLowercase, text: 'One lowercase letter' },
    { met: validation.hasUppercase, text: 'One uppercase letter' },
    { met: validation.hasNumber, text: 'One number' },
  ];

  return (
    <View style={[{ marginTop: 8 }, style]}>
      {/* Strength Bar */}
      <View style={{ marginBottom: 8 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}>
          <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '500' }}>
            Password Strength
          </Text>
          <Text style={{ fontSize: 12, color: strengthColor, fontWeight: '600' }}>
            {strengthText}
          </Text>
        </View>
        <View style={{
          height: 4,
          backgroundColor: '#e5e7eb',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <View style={{
            height: '100%',
            backgroundColor: strengthColor,
            width: `${validation.strength}%`,
            borderRadius: 2,
          }} />
        </View>
      </View>

      {/* Requirements List - Compact */}
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        {requirements.map((requirement, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: requirement.met ? '#dcfce7' : '#f3f4f6',
              paddingHorizontal: 6,
              paddingVertical: 3,
              borderRadius: 4,
            }}
          >
            <Ionicons
              name={requirement.met ? 'checkmark-circle' : 'close-circle'}
              size={12}
              color={requirement.met ? '#16a34a' : '#9ca3af'}
            />
            <Text style={{
              marginLeft: 3,
              fontSize: 10,
              color: requirement.met ? '#16a34a' : '#6b7280',
              fontWeight: '500',
            }}>
              {requirement.text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
