// components/register/TermsCheckbox.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { useTheme } from '../../../contexts/ThemeContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface TermsCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  onTermsPress?: () => void;
  onPrivacyPress?: () => void;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({
  checked,
  onToggle,
  onTermsPress,
  onPrivacyPress,
}) => {
  const { colors } = useTheme();

  return (
    <StyledTouchableOpacity 
      onPress={onToggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 8,
      }}
    >
      <StyledView style={{
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: checked ? colors.primary : colors.textSecondary,
        backgroundColor: checked ? colors.primary : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
      }}>
        {checked && (
          <Ionicons name="checkmark" size={16} color="#ffffff" />
        )}
      </StyledView>
      
      <StyledText style={{ 
        flex: 1, 
        color: colors.textSecondary, 
        fontSize: 14,
        lineHeight: 20 
      }}>
        I agree to the{' '}
        <StyledText 
          style={{ 
            color: colors.primary, 
            fontWeight: '600' 
          }}
          onPress={onTermsPress}
        >
          Terms & Conditions
        </StyledText>
        {' '}and{' '}
        <StyledText 
          style={{ 
            color: colors.primary, 
            fontWeight: '600' 
          }}
          onPress={onPrivacyPress}
        >
          Privacy Policy
        </StyledText>
      </StyledText>
    </StyledTouchableOpacity>
  );
};

export default TermsCheckbox;