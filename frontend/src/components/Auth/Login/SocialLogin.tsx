// components/login/SocialLogin.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import { useTheme } from '../../../contexts/ThemeContext';
import ThemedButton from '../../ui/ThemedButton';

const StyledView = styled(View);
const StyledText = styled(Text);

interface SocialLoginProps {
  onGoogleLogin?: () => void;
  onAppleLogin?: () => void;
  onFacebookLogin?: () => void;
}

const SocialLogin: React.FC<SocialLoginProps> = ({
  onGoogleLogin,
  onAppleLogin,
  onFacebookLogin,
}) => {
  const { colors } = useTheme();

  return (
    <StyledView style={{ marginTop: 32 }}>
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
          Or continue with
        </StyledText>
        <StyledView style={{
          flex: 1,
          height: 1,
          backgroundColor: colors.textSecondary,
          opacity: 0.3,
        }} />
      </StyledView>

      {/* Social Buttons */}
      <StyledView style={{ flexDirection: 'row', gap: 12 }}>
        {/* Google Login */}
        {onGoogleLogin && (
          <StyledView style={{ flex: 1 }}>
            <ThemedButton
              title="Google"
              variant="outline"
              size="medium"
              icon="logo-google"
              onPress={onGoogleLogin}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.textSecondary,
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
        {onAppleLogin && (
          <StyledView style={{ flex: 1 }}>
            <ThemedButton
              title="Apple"
              variant="outline"
              size="medium"
              icon="logo-apple"
              onPress={onAppleLogin}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.textSecondary,
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
        {onFacebookLogin && (
          <StyledView style={{ flex: 1 }}>
            <ThemedButton
              title="Facebook"
              variant="outline"
              size="medium"
              icon="logo-facebook"
              onPress={onFacebookLogin}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.textSecondary,
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