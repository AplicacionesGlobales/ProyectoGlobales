// components/ui/SocialLogin.tsx (versión actualizada)
import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import { useTheme } from '../../contexts/ThemeContext';
import ThemedButton from '../ui/ThemedButton';

const StyledView = styled(View);
const StyledText = styled(Text);

interface SocialLoginProps {
  title?: string;
  onGoogleLogin?: () => void;
  onAppleLogin?: () => void;
  onFacebookLogin?: () => void;
  showGoogle?: boolean;
  showApple?: boolean;
  showFacebook?: boolean;
}

const SocialLogin: React.FC<SocialLoginProps> = ({
  title = 'Or continue with',
  onGoogleLogin,
  onAppleLogin,
  onFacebookLogin,
  showGoogle = true,
  showApple = false,
  showFacebook = false,
}) => {
  const { colors } = useTheme();

  // No mostrar nada si no hay providers habilitados
  const hasProviders = showGoogle || showApple || showFacebook;
  if (!hasProviders) return null;

  return (
    <StyledView style={{ marginTop: 30 }}>
      {/* Divider */}
      <StyledView style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <StyledView style={{
          flex: 1,
          height: 1,
          backgroundColor: colors.textSecondary,
          opacity: 0.3,
        }} />
        <StyledText style={{
          paddingHorizontal: 12,
          fontSize: 14,
          color: colors.textSecondary,
        }}>
          {title}
        </StyledText>
        <StyledView style={{
          flex: 1,
          height: 1,
          backgroundColor: colors.textSecondary,
          opacity: 0.3,
        }} />
      </StyledView>

      {/* Social Buttons */}
      <StyledView style={{ 
        flexDirection: 'row', 
        gap: 12,
        justifyContent: 'center' 
      }}>
        {/* Google Login */}
        {showGoogle && onGoogleLogin && (
          <StyledView style={{ flex: 1, maxWidth: showApple || showFacebook ? undefined : 200 }}>
            <ThemedButton
              title="Google"
              variant="outline"
              size="medium"
              icon="logo-google"
              onPress={onGoogleLogin}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.textSecondary + '40',
                borderWidth: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            />
          </StyledView>
        )}

        {/* Apple Login */}
        {showApple && onAppleLogin && (
          <StyledView style={{ flex: 1, maxWidth: showGoogle || showFacebook ? undefined : 200 }}>
            <ThemedButton
              title="Apple"
              variant="outline"
              size="medium"
              icon="logo-apple"
              onPress={onAppleLogin}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.textSecondary + '40',
                borderWidth: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            />
          </StyledView>
        )}

        {/* Facebook Login */}
        {showFacebook && onFacebookLogin && (
          <StyledView style={{ flex: 1, maxWidth: showGoogle || showApple ? undefined : 200 }}>
            <ThemedButton
              title="Facebook"
              variant="outline"
              size="medium"
              icon="logo-facebook"
              onPress={onFacebookLogin}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.textSecondary + '40',
                borderWidth: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            />
          </StyledView>
        )}
      </StyledView>
    </StyledView>
  );
};

export default SocialLogin;