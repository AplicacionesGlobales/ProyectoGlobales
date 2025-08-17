// components/register/RegisterHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

interface RegisterHeaderProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  currentStep?: number;
  totalSteps?: number;
}

const RegisterHeader: React.FC<RegisterHeaderProps> = ({ 
  title = 'Create Account',
  subtitle = 'Join Agenda Pro today',
  icon = 'person-add',
  currentStep = 1,
  totalSteps = 3
}) => {
  return (
    <StyledView style={styles.container}>
      {/* Logo/Icon */}
      <StyledView style={styles.logoContainer}>
        <Ionicons name={icon as any} size={45} color="#ffffff" />
      </StyledView>

      {/* Title */}
      <StyledText style={styles.title}>
        {title}
      </StyledText>

      {/* Subtitle */}
      <StyledText style={styles.subtitle}>
        {subtitle}
      </StyledText>

      {/* Progress Steps */}
      <StyledView style={styles.progressContainer}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1;
          const isActive = step === currentStep;
          
          return (
            <StyledView
              key={step}
              style={[
                styles.progressStep,
                {
                  width: isActive ? 40 : 10,
                  backgroundColor: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                }
              ]}
            />
          );
        })}
      </StyledView>
    </StyledView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
    gap: 8,
  },
  progressStep: {
    height: 10,
    borderRadius: 5,
  },
});

export default RegisterHeader;