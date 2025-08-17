// components/login/RememberMeCheckbox.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { useTheme } from '../../contexts/ThemeContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface RememberMeCheckboxProps {
  checked: boolean;
  onToggle: () => void;
}

const RememberMeCheckbox: React.FC<RememberMeCheckboxProps> = ({
  checked,
  onToggle,
}) => {
  const { colors } = useTheme();

  return (
    <StyledTouchableOpacity
      onPress={onToggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <StyledView style={{
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        borderColor: checked ? colors.primary : colors.textSecondary,
        backgroundColor: checked ? colors.primary : 'transparent',
      }}>
        {checked && (
          <Ionicons name="checkmark" size={16} color="#ffffff" />
        )}
      </StyledView>
      <StyledText style={{
        fontSize: 14,
        color: colors.textSecondary,
      }}>
        Remember me
      </StyledText>
    </StyledTouchableOpacity>
  );
};

export default RememberMeCheckbox;