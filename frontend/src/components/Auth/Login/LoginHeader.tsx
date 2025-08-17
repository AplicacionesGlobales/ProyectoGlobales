// components/login/LoginHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { useTheme } from '../../../contexts/ThemeContext';

const StyledView = styled(View);
const StyledText = styled(Text);

interface LoginHeaderProps {
  logoComponent?: React.ReactNode;
}

const LoginHeader: React.FC<LoginHeaderProps> = ({ logoComponent }) => {
  const { colors } = useTheme();

  return (
    <StyledView style={styles.container}>
      {/* Logo/Icon */}
      <StyledView 
        style={[
          styles.logoContainer,
          { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
        ]}
      >
        {/* {logoComponent || (
          appConfig?.logo ? (
            <img 
              src={appConfig.logo.uri} 
              style={{ 
                width: Math.min(appConfig.logo.width, 45), 
                height: Math.min(appConfig.logo.height, 45) 
              }} 
              alt="Logo"
            />
          ) : (
            <Ionicons name="calendar" size={45} color="#ffffff" />
          )
        )} */}
        <Ionicons name="calendar" size={45} color="#ffffff" />
      </StyledView>

      {/* App Name */}
      {/* <StyledText style={styles.appName}>
        {appConfig?.branding.appName || 'Agenda Pro'}
      </StyledText> */}

      {/* App Name */}
      <StyledText style={styles.appName}>
        {'Agenda Pro'}
      </StyledText>

      {/* Company Name/Subtitle */}
      {/* <StyledText style={styles.subtitle}>
        {appConfig?.branding.companyName || 'Manage your business professionally'}
      </StyledText> */}

      <StyledText style={styles.subtitle}>
        {'Manage your business professionally'}
      </StyledText>
    </StyledView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    marginBottom: 20,
    borderRadius: 40,
  },
  appName: {
    marginBottom: 8,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

export default LoginHeader;