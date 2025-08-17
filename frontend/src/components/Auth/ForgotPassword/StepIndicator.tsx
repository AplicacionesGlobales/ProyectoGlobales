// components/Auth/ForgotPassword/StepIndicator.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const { colors } = useTheme();
  
  const steps = [
    { number: 1, title: 'Email', icon: 'mail' },
    { number: 2, title: 'Código', icon: 'keypad' },
    { number: 3, title: 'Contraseña', icon: 'lock-closed' },
  ];

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'active';
    return 'inactive';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'active': return colors.primary;
      case 'inactive': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const getStepTextColor = (status: string) => {
    switch (status) {
      case 'completed': return '#ffffff';
      case 'active': return '#ffffff';
      case 'inactive': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const getStepTitleColor = (status: string) => {
    switch (status) {
      case 'active': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 32,
    }}>
      {steps.map((step, index) => {
        const status = getStepStatus(step.number);
        const color = getStepColor(status);
        const textColor = getStepTextColor(status);
        const titleColor = getStepTitleColor(status);

        return (
          <React.Fragment key={step.number}>
            {/* Step Circle */}
            <View style={{ alignItems: 'center' }}>
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: color,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
                borderWidth: status === 'inactive' ? 2 : 0,
                borderColor: status === 'inactive' ? colors.textSecondary + '40' : 'transparent',
              }}>
                {status === 'completed' ? (
                  <Ionicons name="checkmark" size={24} color="#ffffff" />
                ) : (
                  <Ionicons 
                    name={step.icon as any} 
                    size={20} 
                    color={textColor} 
                  />
                )}
              </View>
              
              <Text style={{
                fontSize: 12,
                fontWeight: status === 'active' ? '600' : '500',
                color: titleColor,
                textAlign: 'center',
              }}>
                {step.title}
              </Text>
            </View>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <View style={{
                flex: 1,
                height: 2,
                backgroundColor: currentStep > step.number ? colors.success : colors.textSecondary + '40',
                marginHorizontal: 8,
                marginBottom: 20,
              }} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};