// components/login/LoginHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLogo } from '../../../hooks/useBrandImage';

const StyledView = styled(View);
const StyledText = styled(Text);

interface LoginHeaderProps {
  logoComponent?: React.ReactNode;
}

const LoginHeader: React.FC<LoginHeaderProps> = ({ logoComponent }) => {
  const { colors } = useTheme();
  const { imageUrl, isLoading, isAvailable } = useLogo();

  // Debug logs
  console.log('🖼️ LoginHeader Debug:', {
    imageUrl,
    isLoading,
    isAvailable,
    hasLogoComponent: !!logoComponent
  });

  // Función para renderizar el logo
  const renderLogo = () => {
    // Si hay un logoComponent personalizado, usarlo
    if (logoComponent) {
      console.log('📷 Using custom logoComponent');
      return logoComponent;
    }

    // Si tenemos logo cargado desde el backend, usarlo
    if (!isLoading && isAvailable && imageUrl) {
      console.log('📷 Using backend logo:', imageUrl);
      return (
        <Image 
          source={{ uri: imageUrl }}
          style={styles.logoImage}
          resizeMode="contain"
          onLoad={() => console.log('✅ Logo loaded successfully')}
          onError={(error) => console.error('❌ Logo load error:', error)}
        />
      );
    }

    // Fallback al ícono por defecto
    console.log('📷 Using fallback icon');
    return <Ionicons name="calendar" size={45} color="#ffffff" />;
  };

  return (
    <StyledView style={styles.container}>
      {/* Logo/Icon */}
      <StyledView 
        style={[
          styles.logoContainer,
          { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
        ]}
      >
        {renderLogo()}
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
  logoImage: {
    width: 50,
    height: 50,
    maxWidth: 50,
    maxHeight: 50,
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