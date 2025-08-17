// components/Auth/ForgotPassword/ForgotPasswordHeader.tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface ForgotPasswordHeaderProps {
  onBack?: () => void;
}

export const ForgotPasswordHeader: React.FC<ForgotPasswordHeaderProps> = ({ onBack }) => {
  const { colors } = useTheme();

  return (
    <StyledView className="flex-row items-center justify-between px-6 pt-12 pb-4">
      {onBack && (
        <StyledTouchableOpacity
          onPress={onBack}
          className="p-3 rounded-full"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </StyledTouchableOpacity>
      )}
      <StyledView className="flex-1" />
    </StyledView>
  );
};